import React, { useEffect, useRef, useState, useCallback } from "react";

// =============================================
//  Festival Sim — TypeScript + React + Canvas (Isometric)
//  Theme Park / Theme Hospital style diamond tiles.
//  Features:
//   • Diamond-tile isometric grid renderer
//   • Building palette (Stage/Stall/Toilet) with costs & refunds
//   • A* pathfinding on tile grid
//   • Crowd AI (wander, spend at stalls, toilet need, mood)
//   • Time, curfew noise fines, P&L tracking
//   • Save/Load to localStorage
//   • UI tabs with Tailwind styling
//   • Entrance QUEUE visuals + bouncer throughput
//   • SET SCHEDULES (acts pull crowds to stages by time)
//   • RAIN OVERLAY with slowdown & mood effects
// =============================================

type Tab = "Plan" | "Build" | "Run" | "Upgrades" | "Settings";
type BuildKind = "Stage" | "Stall" | "Toilet";
type Weather = "Clear" | "Light Rain" | "Heavy Rain";

interface Building {
  kind: BuildKind;
  i: number;
  j: number;
  id: string;
}

interface Agent {
  id: string;
  x: number; // grid coords (float)
  y: number;
  tx: number;
  ty: number;
  path: Array<[number, number]>;
  pathIndex: number;
  mood: number; // 0..100
  needToilet: number; // 0..1
  money: number;
  targetBuildingId?: string;
  state: "wandering" | "heading_to_target" | "using_facility" | "leaving";
  timeAtFacility: number;
  inQueue: boolean;
  queuePosition?: number;
}

interface Act {
  id: string;
  name: string;
  startMin: number;
  endMin: number;
  stageId: string;
  attractionRadius: number;
}

interface GameState {
  buildings: Building[];
  agents: Agent[];
  balance: number;
  currentTime: number; // minutes since start
  gameSpeed: number;
  isRunning: boolean;
  weather: Weather;
  acts: Act[];
  entranceQueue: Agent[];
  bouncerThroughput: number;
  totalTickets: number;
  totalRevenue: number;
  totalFines: number;
}

interface Upgrades {
  marketing: boolean;
  cleanCrew: boolean;
  premiumStalls: boolean;
  moreBouncer: boolean;
  weatherProtection: boolean;
}

const GRID_W = 36;
const GRID_H = 22;
const HALF_W = 28; // pixel half width of isometric tile
const HALF_H = 14; // pixel half height of isometric tile
const HEADER_H = 80;
const START_BALANCE = 6000;
const ENTRANCE_I = 18; // middle of grid
const ENTRANCE_J = 0; // top edge

const BUILDINGS: Record<BuildKind, { cost: number; color: string; rev?: number; refund?: number }> = {
  Stage: { cost: 1500, color: "#B43CC8", refund: 1000 },
  Stall: { cost: 450, color: "#E6B428", rev: 15, refund: 300 },
  Toilet: { cost: 320, color: "#56A8FF", refund: 220 },
};

const WEATHER_EFFECTS: Record<Weather, { moodPenalty: number; speedMultiplier: number; color: string }> = {
  "Clear": { moodPenalty: 0, speedMultiplier: 1.0, color: "transparent" },
  "Light Rain": { moodPenalty: -5, speedMultiplier: 0.8, color: "rgba(173, 216, 230, 0.3)" },
  "Heavy Rain": { moodPenalty: -15, speedMultiplier: 0.6, color: "rgba(100, 149, 237, 0.5)" },
};

// A* pathfinding implementation
function astar(start: [number, number], goal: [number, number], blocked: Set<string>): Array<[number, number]> | null {
  const key = (i: number, j: number) => `${i},${j}`;
  const h = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
  
  const open: Array<{ k: string; i: number; j: number; f: number }> = [
    { k: key(start[0], start[1]), i: start[0], j: start[1], f: 0 }
  ];
  const g = new Map<string, number>([[key(start[0], start[1]), 0]]);
  const came = new Map<string, string>();
  const inBounds = (i: number, j: number) => i >= 0 && j >= 0 && i < GRID_W && j < GRID_H;
  
  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    
    if (cur.i === goal[0] && cur.j === goal[1]) {
      const path: Array<[number, number]> = [[cur.i, cur.j]];
      let ck = cur.k;
      while (came.has(ck)) {
        ck = came.get(ck)!;
        const [ci, cj] = ck.split(",").map(Number);
        path.push([ci, cj]);
      }
      path.reverse();
      return path;
    }
    
    const nbrs: Array<[number, number]> = [
      [cur.i + 1, cur.j], [cur.i - 1, cur.j],
      [cur.i, cur.j + 1], [cur.i, cur.j - 1]
    ];
    
    for (const [ni, nj] of nbrs) {
      if (!inBounds(ni, nj)) continue;
      const nk = key(ni, nj);
      if (blocked.has(nk) && !(ni === goal[0] && nj === goal[1])) continue;
      
      const tentative = (g.get(cur.k) ?? Infinity) + 1;
      if (tentative < (g.get(nk) ?? Infinity)) {
        came.set(nk, cur.k);
        g.set(nk, tentative);
        const f = tentative + h([ni, nj], goal);
        if (!open.find((o) => o.k === nk)) {
          open.push({ k: nk, i: ni, j: nj, f });
        }
      }
    }
  }
  return null;
}

// Convert grid coordinates to screen coordinates (isometric)
function gridToScreen(i: number, j: number): [number, number] {
  const x = (i - j) * HALF_W;
  const y = (i + j) * HALF_H;
  return [x, y];
}

// Convert screen coordinates to grid coordinates
function screenToGrid(screenX: number, screenY: number): [number, number] {
  const i = (screenX / HALF_W + screenY / HALF_H) / 2;
  const j = (screenY / HALF_H - screenX / HALF_W) / 2;
  return [Math.floor(i), Math.floor(j)];
}

// Toast notification system
let toastTimer: any = null;
function toast(msg: string) {
  clearTimeout(toastTimer);
  let el = document.getElementById("__toast");
  if (!el) {
    el = document.createElement("div");
    el.id = "__toast";
    el.style.cssText = `
      position: fixed; bottom: 16px; right: 16px; padding: 12px 16px;
      background: #1e293b; color: #fff; border-radius: 12px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.3); z-index: 1000;
      font-family: system-ui; font-size: 14px; max-width: 300px;
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = "1";
  toastTimer = setTimeout(() => {
    if (el) el.style.opacity = "0";
  }, 2500);
}

function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<Tab>("Plan");
  const [selectedBuild, setSelectedBuild] = useState<BuildKind>("Stage");
  const [gameState, setGameState] = useState<GameState>({
    buildings: [],
    agents: [],
    balance: START_BALANCE,
    currentTime: 0,
    gameSpeed: 1,
    isRunning: false,
    weather: "Clear",
    acts: [],
    entranceQueue: [],
    bouncerThroughput: 2, // agents per second
    totalTickets: 0,
    totalRevenue: 0,
    totalFines: 0,
  });
  const [upgrades, setUpgrades] = useState<Upgrades>({
    marketing: false,
    cleanCrew: false,
    premiumStalls: false,
    moreBouncer: false,
    weatherProtection: false,
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });

  // Save game state to localStorage
  const saveGame = useCallback(() => {
    const saveData = {
      gameState,
      upgrades,
      timestamp: Date.now(),
    };
    localStorage.setItem("festival-sim-save", JSON.stringify(saveData));
    toast("Game saved!");
  }, [gameState, upgrades]);

  // Load game state from localStorage
  const loadGame = useCallback(() => {
    const saveData = localStorage.getItem("festival-sim-save");
    if (saveData) {
      const { gameState: loadedState, upgrades: loadedUpgrades } = JSON.parse(saveData);
      setGameState(loadedState);
      setUpgrades(loadedUpgrades);
      toast("Game loaded!");
    } else {
      toast("No save data found!");
    }
  }, []);

  // Generate a random agent
  const createAgent = useCallback((inQueue = false): Agent => {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      id,
      x: ENTRANCE_I + (Math.random() - 0.5) * 2,
      y: ENTRANCE_J + Math.random(),
      tx: ENTRANCE_I,
      ty: ENTRANCE_J,
      path: [],
      pathIndex: 0,
      mood: 75 + Math.random() * 25,
      needToilet: Math.random() * 0.3,
      money: 10 + Math.random() * 40,
      state: inQueue ? "wandering" : "wandering",
      timeAtFacility: 0,
      inQueue,
      queuePosition: inQueue ? gameState.entranceQueue.length : undefined,
    };
  }, [gameState.entranceQueue.length]);

  // Update agents AI and movement
  const updateAgents = useCallback((deltaTime: number, state: GameState): GameState => {
    const blocked = new Set(state.buildings.map(b => `${b.i},${b.j}`));
    const weatherEffect = WEATHER_EFFECTS[state.weather];
    
    const updatedAgents = state.agents.map(agent => {
      let newAgent = { ...agent };
      
      // Apply weather effects
      newAgent.mood = Math.max(0, Math.min(100, agent.mood + weatherEffect.moodPenalty * deltaTime / 60));
      
      // Increase toilet need over time
      newAgent.needToilet = Math.min(1, agent.needToilet + deltaTime * 0.001);
      
      // If toilet need is high, prioritize finding toilet
      if (newAgent.needToilet > 0.7 && newAgent.state === "wandering") {
        const toilets = state.buildings.filter(b => b.kind === "Toilet");
        if (toilets.length > 0) {
          const nearestToilet = toilets[Math.floor(Math.random() * toilets.length)];
          newAgent.targetBuildingId = nearestToilet.id;
          newAgent.state = "heading_to_target";
          const path = astar([Math.floor(agent.x), Math.floor(agent.y)], [nearestToilet.i, nearestToilet.j], blocked);
          newAgent.path = path || [];
          newAgent.pathIndex = 0;
        }
      }
      
      // Handle agent movement
      if (newAgent.path.length > 0 && newAgent.pathIndex < newAgent.path.length) {
        const [ti, tj] = newAgent.path[newAgent.pathIndex];
        const dx = ti - newAgent.x;
        const dy = tj - newAgent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < 0.1) {
          newAgent.pathIndex++;
          if (newAgent.pathIndex >= newAgent.path.length) {
            newAgent.path = [];
            newAgent.pathIndex = 0;
            
            // Arrived at destination
            if (newAgent.state === "heading_to_target" && newAgent.targetBuildingId) {
              newAgent.state = "using_facility";
              newAgent.timeAtFacility = 0;
            }
          }
        } else {
          const speed = 2 * deltaTime * weatherEffect.speedMultiplier;
          newAgent.x += (dx / dist) * speed;
          newAgent.y += (dy / dist) * speed;
        }
      } else if (newAgent.state === "wandering") {
        // Random wandering
        const speed = 1 * deltaTime * weatherEffect.speedMultiplier;
        const angle = Math.random() * Math.PI * 2;
        const newX = newAgent.x + Math.cos(angle) * speed;
        const newY = newAgent.y + Math.sin(angle) * speed;
        
        if (newX >= 1 && newX < GRID_W - 1 && newY >= 1 && newY < GRID_H - 1) {
          newAgent.x = newX;
          newAgent.y = newY;
        }
      }
      
      // Handle facility usage
      if (newAgent.state === "using_facility") {
        newAgent.timeAtFacility += deltaTime;
        
        const building = state.buildings.find(b => b.id === newAgent.targetBuildingId);
        if (building) {
          if (building.kind === "Toilet" && newAgent.timeAtFacility > 3) {
            newAgent.needToilet = 0;
            newAgent.mood = Math.min(100, newAgent.mood + 10);
            newAgent.state = "wandering";
            newAgent.targetBuildingId = undefined;
          } else if (building.kind === "Stall" && newAgent.timeAtFacility > 2) {
            if (newAgent.money >= 5) {
              newAgent.money -= 5;
              newAgent.mood = Math.min(100, newAgent.mood + 15);
              // Revenue will be added in main update
            }
            newAgent.state = "wandering";
            newAgent.targetBuildingId = undefined;
          }
        }
      }
      
      return newAgent;
    });
    
    // Process entrance queue
    const updatedQueue = [...state.entranceQueue];
    const agentsToAdd: Agent[] = [];
    
    if (updatedQueue.length > 0 && state.isRunning) {
      const throughputRate = state.bouncerThroughput * (upgrades.moreBouncer ? 1.5 : 1);
      const agentsToProcess = Math.floor(throughputRate * deltaTime);
      
      for (let i = 0; i < Math.min(agentsToProcess, updatedQueue.length); i++) {
        const agent = updatedQueue.shift()!;
        agent.inQueue = false;
        agent.x = ENTRANCE_I + (Math.random() - 0.5);
        agent.y = ENTRANCE_J + 1;
        agentsToAdd.push(agent);
      }
    }
    
    return {
      ...state,
      agents: [...updatedAgents, ...agentsToAdd],
      entranceQueue: updatedQueue,
    };
  }, [upgrades.moreBouncer]);

  // Handle canvas click for building placement
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (tab !== "Build" || isPanning) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left - canvas.width / 2 - dragOffset.x;
    const canvasY = e.clientY - rect.top - canvas.height / 2 - dragOffset.y + HEADER_H;
    
    const [i, j] = screenToGrid(canvasX, canvasY);
    
    if (i >= 0 && j >= 0 && i < GRID_W && j < GRID_H) {
      const key = `${i},${j}`;
      const existingBuilding = gameState.buildings.find(b => b.i === i && b.j === j);
      
      if (existingBuilding) {
        // Remove building and refund
        const refund = BUILDINGS[existingBuilding.kind].refund || 0;
        setGameState(prev => ({
          ...prev,
          buildings: prev.buildings.filter(b => b.id !== existingBuilding.id),
          balance: prev.balance + refund,
        }));
        toast(`${existingBuilding.kind} demolished! Refunded $${refund}`);
      } else {
        // Place building
        const cost = BUILDINGS[selectedBuild].cost;
        if (gameState.balance >= cost) {
          const newBuilding: Building = {
            kind: selectedBuild,
            i,
            j,
            id: `${selectedBuild}_${i}_${j}_${Date.now()}`,
          };
          
          setGameState(prev => ({
            ...prev,
            buildings: [...prev.buildings, newBuilding],
            balance: prev.balance - cost,
          }));
          toast(`${selectedBuild} built for $${cost}`);
        } else {
          toast("Not enough money!");
        }
      }
    }
  }, [tab, selectedBuild, gameState.balance, gameState.buildings, dragOffset, isPanning]);

  // Handle mouse events for panning
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 1 || (e.button === 0 && tab !== "Build")) { // Middle mouse or left click when not building
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [tab]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setDragOffset(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Main game loop
  useEffect(() => {
    if (!gameState.isRunning) return;
    
    const interval = setInterval(() => {
      setGameState(prevState => {
        let newState = { ...prevState };
        const deltaTime = gameState.gameSpeed * 0.1; // 100ms * speed multiplier
        
        // Update time
        newState.currentTime += deltaTime / 60; // Convert to minutes
        
        // Spawn new agents randomly
        if (Math.random() < 0.02 * gameState.gameSpeed) {
          const newAgent = createAgent(true);
          newState.entranceQueue = [...newState.entranceQueue, newAgent];
          newState.totalTickets++;
        }
        
        // Update agents
        newState = updateAgents(deltaTime, newState);
        
        // Generate revenue from stalls
        newState.buildings.forEach(building => {
          if (building.kind === "Stall") {
            const nearbyAgents = newState.agents.filter(agent => {
              const dist = Math.sqrt((agent.x - building.i) ** 2 + (agent.y - building.j) ** 2);
              return dist < 2 && agent.state === "using_facility" && agent.targetBuildingId === building.id;
            });
            
            nearbyAgents.forEach(agent => {
              if (Math.random() < 0.3 * deltaTime && agent.money >= 5) {
                const revenue = BUILDINGS.Stall.rev || 10;
                newState.balance += revenue;
                newState.totalRevenue += revenue;
              }
            });
          }
        });
        
        // Apply noise fines after curfew (assuming 22:00 is curfew)
        const hourOfDay = (newState.currentTime / 60) % 24;
        if (hourOfDay > 22 && newState.buildings.some(b => b.kind === "Stage")) {
          const fine = 50 * gameState.gameSpeed;
          newState.balance -= fine;
          newState.totalFines += fine;
        }
        
        // Weather changes occasionally
        if (Math.random() < 0.001) {
          const weathers: Weather[] = ["Clear", "Light Rain", "Heavy Rain"];
          newState.weather = weathers[Math.floor(Math.random() * weathers.length)];
        }
        
        return newState;
      });
    }, 100);
    
    return () => clearInterval(interval);
  }, [gameState.isRunning, gameState.gameSpeed, createAgent, updateAgents]);

  // Canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - HEADER_H;
    
    // Clear canvas
    ctx.fillStyle = "#1a3b2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save context and apply pan offset
    ctx.save();
    ctx.translate(canvas.width / 2 + dragOffset.x, canvas.height / 2 + dragOffset.y - HEADER_H);
    
    // Draw grid tiles
    for (let i = 0; i < GRID_W; i++) {
      for (let j = 0; j < GRID_H; j++) {
        const [x, y] = gridToScreen(i, j);
        
        // Draw diamond tile
        ctx.beginPath();
        ctx.moveTo(x, y - HALF_H);
        ctx.lineTo(x + HALF_W, y);
        ctx.lineTo(x, y + HALF_H);
        ctx.lineTo(x - HALF_W, y);
        ctx.closePath();
        
        ctx.fillStyle = (i + j) % 2 === 0 ? "#2d4a2d" : "#254425";
        ctx.fill();
        ctx.strokeStyle = "#3a5f3a";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
    
    // Draw buildings
    gameState.buildings.forEach(building => {
      const [x, y] = gridToScreen(building.i, building.j);
      const config = BUILDINGS[building.kind];
      
      ctx.fillStyle = config.color;
      ctx.fillRect(x - HALF_W * 0.8, y - HALF_H * 0.8, HALF_W * 1.6, HALF_H * 1.6);
      
      // Building label
      ctx.fillStyle = "white";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(building.kind[0], x, y + 3);
    });
    
    // Draw agents
    gameState.agents.forEach(agent => {
      const [x, y] = gridToScreen(agent.x, agent.y);
      
      // Agent mood affects color
      const moodRatio = agent.mood / 100;
      const red = Math.floor((1 - moodRatio) * 255);
      const green = Math.floor(moodRatio * 255);
      ctx.fillStyle = `rgb(${red}, ${green}, 0)`;
      
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();
      
      // Toilet need indicator
      if (agent.needToilet > 0.5) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(x, y - 8, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw entrance queue
    gameState.entranceQueue.forEach((agent, index) => {
      const queueX = ENTRANCE_I + (index % 5) - 2;
      const queueY = ENTRANCE_J - Math.floor(index / 5) - 1;
      const [x, y] = gridToScreen(queueX, queueY);
      
      ctx.fillStyle = "#ffaa00";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
    
    // Draw weather overlay
    if (gameState.weather !== "Clear") {
      const weatherEffect = WEATHER_EFFECTS[gameState.weather];
      ctx.fillStyle = weatherEffect.color;
      ctx.fillRect(-canvas.width, -canvas.height, canvas.width * 2, canvas.height * 2);
      
      // Rain drops animation (simple)
      if (gameState.weather.includes("Rain")) {
        ctx.strokeStyle = "rgba(200, 200, 255, 0.6)";
        ctx.lineWidth = 1;
        const dropCount = gameState.weather === "Heavy Rain" ? 100 : 50;
        for (let i = 0; i < dropCount; i++) {
          const x = (Math.random() - 0.5) * canvas.width * 2;
          const y = (Math.random() - 0.5) * canvas.height * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x - 5, y + 10);
          ctx.stroke();
        }
      }
    }
    
    ctx.restore();
  }, [gameState, dragOffset]);

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60) % 24;
    const mins = Math.floor(minutes % 60);
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const formatCurrency = (amount: number): string => {
    return `$${Math.floor(amount).toLocaleString()}`;
  };

  return (
    <div className="w-full h-full bg-slate-900 text-white overflow-hidden">
      {/* Header UI */}
      <div className="h-20 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <h1 className="text-2xl font-bold text-purple-400">Festival Sim</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2">
              <span className="text-green-400">💰</span>
              <span>{formatCurrency(gameState.balance)}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2">
              <span className="text-blue-400">🕒</span>
              <span>{formatTime(gameState.currentTime)}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2">
              <span className="text-yellow-400">👥</span>
              <span>{gameState.agents.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2">
              <span className="text-orange-400">🎫</span>
              <span>{gameState.entranceQueue.length}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-700 rounded-xl px-3 py-2">
            <span className="text-cyan-400">🌤️</span>
            <span className="text-sm">{gameState.weather}</span>
          </div>
          <button
            onClick={() => setGameState(prev => ({ ...prev, isRunning: !prev.isRunning }))}
            className={`px-4 py-2 rounded-xl font-medium ${
              gameState.isRunning
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {gameState.isRunning ? "⏸️ Pause" : "▶️ Play"}
          </button>
          <select
            value={gameState.gameSpeed}
            onChange={(e) => setGameState(prev => ({ ...prev, gameSpeed: Number(e.target.value) }))}
            className="bg-slate-700 text-white px-3 py-2 rounded-xl border border-slate-600"
          >
            <option value={0.5}>0.5x</option>
            <option value={1}>1x</option>
            <option value={2}>2x</option>
            <option value={4}>4x</option>
          </select>
        </div>
      </div>

      <div className="flex h-full">
        {/* Left Sidebar - Tabs */}
        <div className="w-64 bg-slate-800 border-r border-slate-700 flex flex-col">
          {/* Tab Navigation */}
          <div className="flex flex-col p-4 space-y-2">
            {(["Plan", "Build", "Run", "Upgrades", "Settings"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  tab === t
                    ? "bg-purple-600 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 p-4 overflow-y-auto">
            {tab === "Plan" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Festival Overview</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-300">Total Revenue</div>
                    <div className="text-xl font-bold text-green-400">{formatCurrency(gameState.totalRevenue)}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-300">Tickets Sold</div>
                    <div className="text-xl font-bold text-blue-400">{gameState.totalTickets}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-300">Total Fines</div>
                    <div className="text-xl font-bold text-red-400">{formatCurrency(gameState.totalFines)}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-purple-300">Buildings</h4>
                  {Object.entries(
                    gameState.buildings.reduce((acc, b) => {
                      acc[b.kind] = (acc[b.kind] || 0) + 1;
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([kind, count]) => (
                    <div key={kind} className="flex justify-between text-sm">
                      <span>{kind}s:</span>
                      <span className="text-yellow-400">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "Build" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Build Palette</h3>
                <div className="space-y-3">
                  {Object.entries(BUILDINGS).map(([kind, config]) => (
                    <button
                      key={kind}
                      onClick={() => setSelectedBuild(kind as BuildKind)}
                      className={`w-full p-3 rounded-xl border-2 transition-colors ${
                        selectedBuild === kind
                          ? "border-purple-500 bg-purple-600/20"
                          : "border-slate-600 bg-slate-700 hover:bg-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded"
                            style={{ backgroundColor: config.color }}
                          />
                          <span className="font-medium">{kind}</span>
                        </div>
                        <span className="text-green-400 font-bold">{formatCurrency(config.cost)}</span>
                      </div>
                      {config.rev && (
                        <div className="text-xs text-slate-400 mt-1">
                          Revenue: {formatCurrency(config.rev)}/visit
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <div className="text-sm text-slate-400 mt-4">
                  💡 Click on tiles to build, click on buildings to demolish and get refund
                </div>
              </div>
            )}

            {tab === "Run" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Live Stats</h3>
                <div className="space-y-3">
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-300">Visitors in Park</div>
                    <div className="text-xl font-bold text-blue-400">{gameState.agents.length}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-300">Queue Length</div>
                    <div className="text-xl font-bold text-orange-400">{gameState.entranceQueue.length}</div>
                  </div>
                  <div className="bg-slate-700 rounded-lg p-3">
                    <div className="text-sm text-slate-300">Weather</div>
                    <div className="text-lg font-bold text-cyan-400">{gameState.weather}</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={saveGame}
                    className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl font-medium"
                  >
                    💾 Save Game
                  </button>
                  <button
                    onClick={loadGame}
                    className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl font-medium"
                  >
                    📁 Load Game
                  </button>
                </div>
              </div>
            )}

            {tab === "Upgrades" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Upgrades</h3>
                <div className="space-y-3">
                  {[
                    { key: "marketing", name: "Marketing Campaign", cost: 1000, desc: "Attract more visitors" },
                    { key: "cleanCrew", name: "Clean Crew", cost: 800, desc: "Boost visitor mood" },
                    { key: "premiumStalls", name: "Premium Stalls", cost: 1200, desc: "Increase stall revenue" },
                    { key: "moreBouncer", name: "More Bouncers", cost: 600, desc: "Faster queue processing" },
                    { key: "weatherProtection", name: "Weather Protection", cost: 2000, desc: "Reduce rain penalties" },
                  ].map((upgrade) => (
                    <button
                      key={upgrade.key}
                      onClick={() => {
                        if (!upgrades[upgrade.key as keyof Upgrades] && gameState.balance >= upgrade.cost) {
                          setUpgrades(prev => ({ ...prev, [upgrade.key]: true }));
                          setGameState(prev => ({ ...prev, balance: prev.balance - upgrade.cost }));
                          toast(`${upgrade.name} purchased!`);
                        } else if (upgrades[upgrade.key as keyof Upgrades]) {
                          toast("Already purchased!");
                        } else {
                          toast("Not enough money!");
                        }
                      }}
                      className={`w-full p-3 rounded-xl border-2 transition-colors text-left ${
                        upgrades[upgrade.key as keyof Upgrades]
                          ? "border-green-500 bg-green-600/20 cursor-not-allowed"
                          : gameState.balance >= upgrade.cost
                          ? "border-slate-600 bg-slate-700 hover:bg-slate-600"
                          : "border-red-600 bg-red-600/20 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{upgrade.name}</div>
                          <div className="text-xs text-slate-400 mt-1">{upgrade.desc}</div>
                        </div>
                        <div className="text-right">
                          {upgrades[upgrade.key as keyof Upgrades] ? (
                            <span className="text-green-400 font-bold">✓ Owned</span>
                          ) : (
                            <span className="text-yellow-400 font-bold">{formatCurrency(upgrade.cost)}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === "Settings" && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-purple-400">Settings</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      const newWeather = gameState.weather === "Clear" ? "Light Rain" : 
                                       gameState.weather === "Light Rain" ? "Heavy Rain" : "Clear";
                      setGameState(prev => ({ ...prev, weather: newWeather }));
                    }}
                    className="w-full bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-xl font-medium"
                  >
                    🌦️ Change Weather
                  </button>
                  <button
                    onClick={() => {
                      setGameState(prev => ({
                        ...prev,
                        agents: [],
                        entranceQueue: [],
                        currentTime: 0,
                        totalRevenue: 0,
                        totalFines: 0,
                        totalTickets: 0,
                      }));
                      toast("Game reset!");
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-xl font-medium"
                  >
                    🔄 Reset Game
                  </button>
                  <div className="text-sm text-slate-400 space-y-2">
                    <div>• Mouse/pan to navigate</div>
                    <div>• Click tiles to build/demolish</div>
                    <div>• Watch crowd mood (green=happy, red=unhappy)</div>
                    <div>• Yellow dots = toilet needed</div>
                    <div>• Orange queue at entrance</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Game Canvas */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="cursor-crosshair"
            style={{ cursor: tab === "Build" ? "crosshair" : "grab" }}
          />
        </div>
      </div>
    </div>
  );
}

export default App;