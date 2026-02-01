import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { loadProjectManagementData, saveProjectManagementData } from "../../utils/storage";

const createId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

// Şekil tipleri
const shapeTypes = [
    { id: "rectangle", label: "Rectangle", icon: "□" },
    { id: "rounded", label: "Rounded", icon: "▢" },
    { id: "diamond", label: "Diamond", icon: "◇" },
    { id: "circle", label: "Circle", icon: "○" },
    { id: "ellipse", label: "Ellipse", icon: "⬭" },
    { id: "hexagon", label: "Hexagon", icon: "⬡" },
    { id: "parallelogram", label: "Parallelogram", icon: "▱" },
    { id: "cylinder", label: "Cylinder", icon: "⌭" },
];

const defaultNodeStyle = {
    fillColor: "#1a252b",
    strokeColor: "#13a4ec",
    strokeWidth: 2,
    cornerRadius: 8,
    opacity: 1,
    textColor: "#ffffff",
    fontSize: 14,
    fontWeight: "normal",
    textAlign: "center",
};

const createDefaultNode = (shape, x, y) => ({
    id: createId("node"),
    shape: shape,
    x, y,
    width: shape === "circle" ? 120 : 200,
    height: shape === "circle" ? 120 : 120,
    title: "New Item",
    description: "",
    style: { ...defaultNodeStyle },
    sections: [], // Bölümler: [{id, title, content, bgColor, textColor, height}]
    hasSections: false, // Bölümlü mod
    locked: false,
    visible: true,
});

const createDefaultSection = () => ({
    id: createId("sec"),
    title: "Section",
    content: "",
    bgColor: "#283339",
    textColor: "#ffffff",
    height: 32,
});

const ProjectCanvas = () => {
    const canvasRef = useRef(null);
    const [projects, setProjects] = useState([]);
    const [activeProjectId, setActiveProjectId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Seçim
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [selectedConnectionId, setSelectedConnectionId] = useState(null);

    // Modlar
    const [mode, setMode] = useState("select");
    const [connectFromId, setConnectFromId] = useState(null);
    const [shapeToAdd, setShapeToAdd] = useState(null);

    // Sürükleme
    const [dragState, setDragState] = useState(null);
    const [selectionBox, setSelectionBox] = useState(null);

    // Görünüm
    const [zoom, setZoom] = useState(100);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });

    // UI
    const [activeTab, setActiveTab] = useState("style");
    const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [showShapeMenu, setShowShapeMenu] = useState(false);

    // Clipboard & Context Menu
    const [clipboard, setClipboard] = useState([]);
    const [contextMenu, setContextMenu] = useState(null); // {x, y, type: 'canvas'|'node'}

    const activeProject = projects.find((p) => p.id === activeProjectId) || null;
    const selectedNodes = activeProject?.nodes?.filter(n => selectedIds.has(n.id)) || [];
    const singleSelectedNode = selectedNodes.length === 1 ? selectedNodes[0] : null;

    // Veri yükleme
    useEffect(() => {
        const load = async () => {
            const saved = await loadProjectManagementData();
            if (saved?.projects?.length) {
                setProjects(saved.projects);
                setActiveProjectId(saved.activeProjectId || saved.projects[0].id);
            }
            setIsLoading(false);
        };
        load();
    }, []);

    // Veri kaydetme
    useEffect(() => {
        if (isLoading) return;
        saveProjectManagementData({ projects, activeProjectId });
    }, [projects, activeProjectId, isLoading]);

    const updateProject = useCallback((recipe) => {
        setProjects((prev) => prev.map((p) => (p.id === activeProjectId ? recipe(p) : p)));
    }, [activeProjectId]);

    // Klavye kısayolları
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

            if (e.key === "Delete" || e.key === "Backspace") {
                handleDeleteSelected();
            } else if (e.key === "Escape") {
                setSelectedIds(new Set());
                setSelectedConnectionId(null);
                setMode("select");
                setConnectFromId(null);
                setShapeToAdd(null);
                setContextMenu(null);
            } else if (e.ctrlKey && e.key === "a") {
                e.preventDefault();
                if (activeProject?.nodes) {
                    setSelectedIds(new Set(activeProject.nodes.map(n => n.id)));
                }
            } else if (e.ctrlKey && e.key === "c") {
                e.preventDefault();
                handleCopy();
            } else if (e.ctrlKey && e.key === "v") {
                e.preventDefault();
                handlePaste();
            } else if (e.ctrlKey && e.key === "d") {
                e.preventDefault();
                handleDuplicate();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [activeProject, selectedIds, clipboard]);

    // Ctrl + Scroll zoom
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.ctrlKey && canvasRef.current?.contains(e.target)) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -10 : 10;
                setZoom(z => Math.max(25, Math.min(200, z + delta)));
            }
        };
        window.addEventListener("wheel", handleWheel, { passive: false });
        return () => window.removeEventListener("wheel", handleWheel);
    }, []);

    const nodeCenters = useMemo(() => {
        if (!activeProject?.nodes) return new Map();
        const map = new Map();
        activeProject.nodes.forEach((node) => {
            // Bölümlü modda toplam yüksekliği hesapla
            let totalHeight = node.height;
            if (node.hasSections && node.sections?.length > 0) {
                const sectionsHeight = node.sections.reduce((sum, sec) => sum + (sec.height || 32), 0);
                const headerHeight = Math.max(36, node.height - sectionsHeight);
                totalHeight = headerHeight + sectionsHeight;
            }
            map.set(node.id, {
                x: node.x + node.width / 2,
                y: node.y + totalHeight / 2
            });
        });
        return map;
    }, [activeProject?.nodes]);

    // Proje işlemleri
    const handleCreateProject = () => {
        if (!newProjectName.trim()) return;
        const newProject = {
            id: createId("project"),
            name: newProjectName.trim(),
            nodes: [],
            connections: [],
        };
        setProjects((prev) => [...prev, newProject]);
        setActiveProjectId(newProject.id);
        setNewProjectName("");
        setIsProjectMenuOpen(false);
    };

    // Öğe ekleme
    const handleAddShape = (shapeId, e) => {
        if (!canvasRef.current || !activeProject) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const x = e ? (e.clientX - rect.left - pan.x) / scale : (rect.width / 2 - pan.x) / scale - 90;
        const y = e ? (e.clientY - rect.top - pan.y) / scale : (rect.height / 2 - pan.y) / scale - 50;

        const newNode = createDefaultNode(shapeId, x, y);
        updateProject((p) => ({ ...p, nodes: [...(p.nodes || []), newNode] }));
        setSelectedIds(new Set([newNode.id]));
        setShowShapeMenu(false);
        setShapeToAdd(null);
        setMode("select");
    };

    // Silme
    const handleDeleteSelected = () => {
        if (selectedIds.size > 0) {
            updateProject((p) => ({
                ...p,
                connections: p.connections.filter(c => !selectedIds.has(c.from) && !selectedIds.has(c.to)),
                nodes: p.nodes.filter((n) => !selectedIds.has(n.id)),
            }));
            setSelectedIds(new Set());
        } else if (selectedConnectionId) {
            updateProject((p) => ({
                ...p,
                connections: p.connections.filter((c) => c.id !== selectedConnectionId),
            }));
            setSelectedConnectionId(null);
        }
        setContextMenu(null);
    };

    // Kopyalama
    const handleCopy = () => {
        if (selectedIds.size === 0) return;
        const nodesToCopy = activeProject?.nodes?.filter(n => selectedIds.has(n.id)) || [];
        setClipboard(nodesToCopy.map(n => ({ ...n })));
    };

    // Yapıştırma
    const handlePaste = (atPosition = null) => {
        if (clipboard.length === 0 || !activeProject) return;
        const offset = 30;
        const newNodes = clipboard.map(node => ({
            ...node,
            id: createId("node"),
            x: atPosition ? atPosition.x : node.x + offset,
            y: atPosition ? atPosition.y : node.y + offset,
            sections: node.sections?.map(s => ({ ...s, id: createId("sec") })) || [],
        }));
        updateProject((p) => ({ ...p, nodes: [...p.nodes, ...newNodes] }));
        setSelectedIds(new Set(newNodes.map(n => n.id)));
        setContextMenu(null);
    };

    // Çoğaltma (Duplicate)
    const handleDuplicate = () => {
        if (selectedIds.size === 0 || !activeProject) return;
        const nodesToDuplicate = activeProject.nodes.filter(n => selectedIds.has(n.id));
        const newNodes = nodesToDuplicate.map(node => ({
            ...node,
            id: createId("node"),
            x: node.x + 40,
            y: node.y + 40,
            sections: node.sections?.map(s => ({ ...s, id: createId("sec") })) || [],
        }));
        updateProject((p) => ({ ...p, nodes: [...p.nodes, ...newNodes] }));
        setSelectedIds(new Set(newNodes.map(n => n.id)));
        setContextMenu(null);
    };

    // Context Menu (Sağ Tık)
    const [contextMenuNodeId, setContextMenuNodeId] = useState(null);

    const handleContextMenu = (e, nodeId = null) => {
        e.preventDefault();
        e.stopPropagation();

        if (nodeId && !selectedIds.has(nodeId)) {
            setSelectedIds(new Set([nodeId]));
        }
        setContextMenuNodeId(nodeId);

        const rect = canvasRef.current?.getBoundingClientRect();
        const scale = zoom / 100;
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            canvasX: rect ? (e.clientX - rect.left - pan.x) / scale : 0,
            canvasY: rect ? (e.clientY - rect.top - pan.y) / scale : 0,
            type: nodeId ? 'node' : 'canvas',
        });
    };

    const closeContextMenu = () => {
        setContextMenu(null);
        setContextMenuNodeId(null);
    };

    // Sağ tık menüsünden silme
    const handleContextDelete = () => {
        if (contextMenuNodeId) {
            // Context menu'den gelen öğeyi sil
            updateProject((p) => ({
                ...p,
                connections: p.connections.filter(c => c.from !== contextMenuNodeId && c.to !== contextMenuNodeId),
                nodes: p.nodes.filter((n) => n.id !== contextMenuNodeId),
            }));
            setSelectedIds(prev => {
                const next = new Set(prev);
                next.delete(contextMenuNodeId);
                return next;
            });
        } else if (selectedIds.size > 0) {
            handleDeleteSelected();
        }
        closeContextMenu();
    };


    // Node güncelleme
    const updateSelectedNodes = (updates) => {
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => selectedIds.has(n.id) ? { ...n, ...updates } : n),
        }));
    };

    const updateNodeStyle = (styleUpdates) => {
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => selectedIds.has(n.id) ? { ...n, style: { ...n.style, ...styleUpdates } } : n),
        }));
    };

    // Bölümlü modu aç/kapa
    const toggleSectionMode = () => {
        if (!singleSelectedNode) return;
        const hasSections = !singleSelectedNode.hasSections;
        const sections = hasSections && (!singleSelectedNode.sections || singleSelectedNode.sections.length === 0)
            ? [createDefaultSection(), createDefaultSection()]
            : singleSelectedNode.sections;
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => n.id === singleSelectedNode.id
                ? { ...n, hasSections, sections }
                : n
            ),
        }));
    };

    // Bölüm ekleme
    const addSection = () => {
        if (!singleSelectedNode) return;
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => n.id === singleSelectedNode.id
                ? { ...n, sections: [...(n.sections || []), createDefaultSection()], hasSections: true }
                : n
            ),
        }));
    };

    const removeSection = (sectionId) => {
        if (!singleSelectedNode) return;
        const newSections = singleSelectedNode.sections.filter(s => s.id !== sectionId);
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => n.id === singleSelectedNode.id
                ? { ...n, sections: newSections, hasSections: newSections.length > 0 }
                : n
            ),
        }));
    };

    const updateSection = (sectionId, updates) => {
        if (!singleSelectedNode) return;
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => n.id === singleSelectedNode.id
                ? { ...n, sections: n.sections.map(s => s.id === sectionId ? { ...s, ...updates } : s) }
                : n
            ),
        }));
    };

    const moveSectionUp = (sectionId) => {
        if (!singleSelectedNode) return;
        const idx = singleSelectedNode.sections.findIndex(s => s.id === sectionId);
        if (idx <= 0) return;
        const newSections = [...singleSelectedNode.sections];
        [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => n.id === singleSelectedNode.id ? { ...n, sections: newSections } : n),
        }));
    };

    const moveSectionDown = (sectionId) => {
        if (!singleSelectedNode) return;
        const idx = singleSelectedNode.sections.findIndex(s => s.id === sectionId);
        if (idx < 0 || idx >= singleSelectedNode.sections.length - 1) return;
        const newSections = [...singleSelectedNode.sections];
        [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => n.id === singleSelectedNode.id ? { ...n, sections: newSections } : n),
        }));
    };

    // Mouse events
    const handleCanvasMouseDown = (e) => {
        if (e.button === 1 || mode === "pan") {
            setIsPanning(true);
            setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
            return;
        }
        if (shapeToAdd) {
            handleAddShape(shapeToAdd, e);
            return;
        }
        if (mode === "select" && !e.shiftKey) {
            const rect = canvasRef.current.getBoundingClientRect();
            setSelectionBox({ startX: e.clientX - rect.left, startY: e.clientY - rect.top, endX: e.clientX - rect.left, endY: e.clientY - rect.top });
        }
        if (!e.shiftKey) {
            setSelectedIds(new Set());
            setSelectedConnectionId(null);
        }
        setConnectFromId(null);
    };

    const handleCanvasMouseMove = (e) => {
        if (isPanning) {
            setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
            return;
        }
        if (selectionBox && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            setSelectionBox(prev => ({ ...prev, endX: e.clientX - rect.left, endY: e.clientY - rect.top }));
            return;
        }
        if (!dragState || !canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        const scale = zoom / 100;
        const dx = (e.clientX - dragState.startX) / scale;
        const dy = (e.clientY - dragState.startY) / scale;

        updateProject((p) => ({
            ...p,
            nodes: p.nodes.map((n) => {
                if (!selectedIds.has(n.id)) return n;
                const original = dragState.originalPositions.get(n.id);
                return { ...n, x: original.x + dx, y: original.y + dy };
            }),
        }));
    };

    const handleCanvasMouseUp = () => {
        if (selectionBox && activeProject?.nodes) {
            const scale = zoom / 100;
            const minX = Math.min(selectionBox.startX, selectionBox.endX);
            const maxX = Math.max(selectionBox.startX, selectionBox.endX);
            const minY = Math.min(selectionBox.startY, selectionBox.endY);
            const maxY = Math.max(selectionBox.startY, selectionBox.endY);

            const newSelected = new Set();
            activeProject.nodes.forEach(node => {
                const nodeLeft = node.x * scale + pan.x;
                const nodeTop = node.y * scale + pan.y;
                const nodeRight = nodeLeft + node.width * scale;
                const nodeBottom = nodeTop + node.height * scale;

                if (nodeLeft < maxX && nodeRight > minX && nodeTop < maxY && nodeBottom > minY) {
                    newSelected.add(node.id);
                }
            });
            setSelectedIds(newSelected);
        }
        setSelectionBox(null);
        setDragState(null);
        setIsPanning(false);
    };

    const handleNodeMouseDown = (e, nodeId) => {
        e.stopPropagation();
        if (!activeProject) return;

        if (mode === "connect") {
            if (!connectFromId) {
                setConnectFromId(nodeId);
            } else if (connectFromId !== nodeId) {
                updateProject((p) => ({
                    ...p,
                    connections: [...(p.connections || []), { id: createId("conn"), from: connectFromId, to: nodeId, label: "", style: { color: "#13a4ec", width: 2, dashed: false } }],
                }));
                setConnectFromId(null);
            }
            return;
        }

        const newSelected = e.shiftKey ? new Set(selectedIds) : new Set();
        if (e.shiftKey && selectedIds.has(nodeId)) {
            newSelected.delete(nodeId);
        } else {
            newSelected.add(nodeId);
        }
        setSelectedIds(newSelected);
        setSelectedConnectionId(null);

        const originalPositions = new Map();
        activeProject.nodes.forEach(n => {
            if (newSelected.has(n.id)) {
                originalPositions.set(n.id, { x: n.x, y: n.y });
            }
        });
        setDragState({ startX: e.clientX, startY: e.clientY, originalPositions });
    };

    // Şekil render
    const renderShape = (node) => {
        const { shape, width, height, style } = node;
        const s = { ...defaultNodeStyle, ...style };

        const commonStyle = {
            fill: s.fillColor,
            stroke: s.strokeColor,
            strokeWidth: s.strokeWidth,
            opacity: s.opacity,
        };

        switch (shape) {
            case "circle":
                return <ellipse cx={width / 2} cy={height / 2} rx={Math.min(width, height) / 2 - s.strokeWidth} ry={Math.min(width, height) / 2 - s.strokeWidth} {...commonStyle} />;
            case "ellipse":
                return <ellipse cx={width / 2} cy={height / 2} rx={width / 2 - s.strokeWidth} ry={height / 2 - s.strokeWidth} {...commonStyle} />;
            case "diamond":
                return <polygon points={`${width / 2},${s.strokeWidth} ${width - s.strokeWidth},${height / 2} ${width / 2},${height - s.strokeWidth} ${s.strokeWidth},${height / 2}`} {...commonStyle} />;
            case "hexagon":
                const hw = width / 4;
                return <polygon points={`${hw},0 ${width - hw},0 ${width},${height / 2} ${width - hw},${height} ${hw},${height} 0,${height / 2}`} {...commonStyle} />;
            case "parallelogram":
                const offset = width * 0.2;
                return <polygon points={`${offset},0 ${width},0 ${width - offset},${height} 0,${height}`} {...commonStyle} />;
            case "cylinder":
                const ry = height * 0.1;
                return (
                    <g {...commonStyle}>
                        <rect x={s.strokeWidth} y={ry} width={width - s.strokeWidth * 2} height={height - ry * 2} rx={0} />
                        <ellipse cx={width / 2} cy={ry} rx={width / 2 - s.strokeWidth} ry={ry} />
                        <ellipse cx={width / 2} cy={height - ry} rx={width / 2 - s.strokeWidth} ry={ry} />
                    </g>
                );
            case "rounded":
                return <rect x={s.strokeWidth / 2} y={s.strokeWidth / 2} width={width - s.strokeWidth} height={height - s.strokeWidth} rx={s.cornerRadius} {...commonStyle} />;
            default: // rectangle
                return <rect x={s.strokeWidth / 2} y={s.strokeWidth / 2} width={width - s.strokeWidth} height={height - s.strokeWidth} rx={2} {...commonStyle} />;
        }
    };

    if (isLoading) {
        return <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: 'var(--canvas-bg)' }}><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent-500)', borderTopColor: 'transparent' }} /></div>;
    }

    if (!projects.length) {
        return (
            <div className="h-full w-full flex items-center justify-center" style={{ backgroundColor: 'var(--canvas-bg)' }}>
                <div className="w-96 p-6 rounded-xl border" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                    <h2 className="text-lg font-bold text-white mb-4">Create New Project</h2>
                    <input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} placeholder="Project name" className="w-full rounded-lg border px-3 py-2 text-sm text-white mb-3" style={{ backgroundColor: 'var(--canvas-bg)', borderColor: 'var(--panel-border)' }} onKeyDown={(e) => e.key === "Enter" && handleCreateProject()} />
                    <button onClick={handleCreateProject} className="w-full rounded-lg px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: 'var(--accent-500)' }}>Create</button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full overflow-hidden text-white flex flex-col" style={{ backgroundColor: 'var(--canvas-bg)' }}>
            {/* Header */}
            {/* Header */}
            <header className="flex items-center justify-between px-6 py-4 shrink-0 backdrop-blur-xl border-b z-20" style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--frame-border)' }}>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="font-bold text-lg text-white tracking-tight">Architecture Canvas</h2>
                    </div>

                    <div className="h-6 w-px bg-white/10 mx-2"></div>

                    <div className="relative">
                        <button
                            onClick={() => setIsProjectMenuOpen(!isProjectMenuOpen)}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm hover:bg-white/5 transition-all"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <span className="font-medium" style={{ color: 'var(--text-main)' }}>{activeProject?.name}</span>
                            <svg className={`w-4 h-4 transition-transform duration-200 ${isProjectMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isProjectMenuOpen && (
                            <div className="absolute top-full left-0 mt-2 w-64 backdrop-blur-xl border rounded-xl shadow-2xl z-50 overflow-hidden" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                                <div className="p-3 border-b bg-white/5" style={{ borderColor: 'var(--panel-border)' }}>
                                    <h3 className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>My Projects</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto space-y-1">
                                    {projects.map(project => (
                                        <button
                                            key={project.id}
                                            onClick={() => {
                                                setActiveProjectId(project.id);
                                                setIsProjectMenuOpen(false);
                                                setSelectedIds(new Set());
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 transition-all flex items-center justify-between group ${activeProjectId === project.id ? 'bg-primary-500/10 text-primary-400' : ''}`}
                                            style={{ color: activeProjectId === project.id ? 'var(--accent-500)' : 'var(--text-main)' }}
                                        >
                                            <span className="font-medium text-sm truncate">{project.name}</span>
                                            {project.id === activeProjectId && <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>}
                                        </button>
                                    ))}
                                </div>
                                <div className="p-3 border-t bg-black/20" style={{ borderColor: 'var(--panel-border)' }}>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newProjectName}
                                            onChange={(e) => setNewProjectName(e.target.value)}
                                            placeholder="New Project..."
                                            className="w-full px-3 py-2 text-xs bg-black/20 border rounded-lg focus:outline-none focus:border-blue-500/50 transition-colors"
                                            style={{ color: 'var(--text-main)', borderColor: 'var(--panel-border)' }}
                                            onKeyDown={e => e.key === "Enter" && handleCreateProject()}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-lg border border-white/5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className={selectedIds.size > 0 ? "text-blue-400 font-medium" : ""}>{selectedIds.size} selected</span>
                    <span className="text-slate-600">•</span>
                    <span>{activeProject?.nodes?.length || 0} items</span>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sol Araç Çubuğu */}
                {/* Sol Araç Çubuğu */}
                <div className="w-14 border-r flex flex-col items-center py-4 gap-2 shrink-0 backdrop-blur-sm z-10" style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--frame-border)' }}>
                    <div className="flex flex-col gap-1 p-1 bg-white/5 rounded-xl border border-white/5 mb-2">
                        <button onClick={() => { setMode("select"); setShapeToAdd(null); }} className={`p-2.5 rounded-lg transition-all ${mode === "select" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-400 hover:text-white hover:bg-white/10"}`} title="Select (V)">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2z" /></svg>
                        </button>
                        <button onClick={() => { setMode("pan"); setShapeToAdd(null); }} className={`p-2.5 rounded-lg transition-all ${mode === "pan" ? "bg-blue-500 text-white shadow-lg shadow-blue-500/25" : "text-slate-400 hover:text-white hover:bg-white/10"}`} title="Pan (H)">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a4 4 0 118 0v3m-9 4h10a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" /></svg>
                        </button>
                        <button onClick={() => { setMode("connect"); setShapeToAdd(null); }} className={`p-2.5 rounded-lg transition-all ${mode === "connect" ? "bg-amber-500 text-white shadow-lg shadow-amber-500/25" : "text-slate-400 hover:text-white hover:bg-white/10"}`} title="Connection">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101" /></svg>
                        </button>
                    </div>

                    <div className="w-8 h-px bg-white/10 my-2" />

                    {/* Şekil butonları */}
                    <div className="flex flex-col gap-1 w-full px-2">
                        {shapeTypes.slice(0, 4).map(shape => (
                            <button key={shape.id} onClick={() => { setShapeToAdd(shape.id); setMode("add"); }} className={`p-2 rounded-lg text-lg transition-all ${shapeToAdd === shape.id ? "bg-green-500 text-white shadow-lg shadow-green-500/25" : "text-slate-400 hover:text-white hover:bg-white/10"}`} title={shape.label}>{shape.icon}</button>
                        ))}
                        <button onClick={() => setShowShapeMenu(!showShapeMenu)} className={`p-2 rounded-lg transition-all ${showShapeMenu ? "bg-white/10 text-white" : "text-slate-400 hover:text-white hover:bg-white/10"}`} title="Other shapes">⋯</button>
                    </div>

                    {showShapeMenu && (
                        <div className="absolute left-16 top-48 w-40 rounded-xl border border-white/10 bg-slate-800/95 backdrop-blur-xl shadow-2xl z-50 p-1.5 animate-in fade-in slide-in-from-left-2 duration-200">
                            <div className="text-[10px] font-semibold text-slate-500 px-2 py-1 uppercase tracking-wider mb-1">More Shapes</div>
                            <div className="grid grid-cols-2 gap-1">
                                {shapeTypes.map(shape => (
                                    <button key={shape.id} onClick={() => { setShapeToAdd(shape.id); setMode("add"); setShowShapeMenu(false); }} className="w-full text-left px-2 py-2 rounded-lg text-xs text-slate-300 hover:bg-blue-500/20 hover:text-blue-400 flex flex-col items-center gap-1 transition-colors">
                                        <span className="text-lg">{shape.icon}</span>
                                        <span>{shape.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="w-8 h-px bg-white/10 my-2" />

                    <button onClick={handleDeleteSelected} disabled={selectedIds.size === 0 && !selectedConnectionId} className={`p-2.5 rounded-lg transition-all ${selectedIds.size > 0 || selectedConnectionId ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" : "text-slate-700 cursor-not-allowed"}`} title="Delete (Delete)">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>

                {/* Kanvas */}
                <div ref={canvasRef} onMouseDown={handleCanvasMouseDown} onMouseMove={handleCanvasMouseMove} onMouseUp={handleCanvasMouseUp} onMouseLeave={handleCanvasMouseUp} onContextMenu={(e) => handleContextMenu(e)} onClick={closeContextMenu} className={`flex-1 relative overflow-hidden themed-canvas ${mode === "pan" || isPanning ? "cursor-grab" : shapeToAdd ? "cursor-crosshair" : "cursor-default"}`} style={{ backgroundPosition: `${pan.x}px ${pan.y}px` }}>
                    <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom / 100})`, transformOrigin: "0 0" }}>
                        {/* Bağlantılar - öğelerden önce render edilir (arka planda kalır) */}
                        <svg width="10000" height="10000" className="absolute top-0 left-0 pointer-events-none" style={{ overflow: 'visible' }}>
                            {activeProject?.connections?.map((conn) => {
                                const start = nodeCenters.get(conn.from);
                                const end = nodeCenters.get(conn.to);
                                if (!start || !end) return null;
                                const midX = (start.x + end.x) / 2;
                                const isSelected = selectedConnectionId === conn.id;
                                return (
                                    <g key={conn.id} onClick={(e) => { e.stopPropagation(); setSelectedConnectionId(conn.id); setSelectedIds(new Set()); }} className="pointer-events-auto cursor-pointer">
                                        <path d={`M${start.x},${start.y} C${midX},${start.y} ${midX},${end.y} ${end.x},${end.y}`} stroke={isSelected ? "#13a4ec" : (conn.style?.color || "#475569")} strokeWidth={isSelected ? 3 : (conn.style?.width || 2)} fill="none" strokeDasharray={conn.style?.dashed ? "6,4" : "none"} />
                                        <circle cx={end.x} cy={end.y} r="5" fill={conn.style?.color || "#13a4ec"} />
                                    </g>
                                );
                            })}
                        </svg>

                        {/* Öğeler */}
                        {activeProject?.nodes?.filter(n => n.visible !== false).map((node) => {
                            const isSelected = selectedIds.has(node.id);
                            const s = { ...defaultNodeStyle, ...node.style };
                            const totalSectionHeight = node.hasSections && node.sections?.length > 0
                                ? node.sections.reduce((sum, sec) => sum + (sec.height || 32), 0)
                                : 0;
                            const headerHeight = node.height - totalSectionHeight;

                            return (
                                <div key={node.id} onMouseDown={(e) => handleNodeMouseDown(e, node.id)} onContextMenu={(e) => handleContextMenu(e, node.id)} className={`absolute cursor-move select-none ${isSelected ? "ring-2 ring-[#13a4ec] ring-offset-1 ring-offset-[#101c22]" : ""} ${connectFromId === node.id ? "ring-2 ring-amber-400" : ""}`} style={{ left: node.x, top: node.y, width: node.width, minHeight: node.height }}>
                                    {/* Şekil arka planı - sadece bölümsüz modda veya dikdörtgen şekillerde */}
                                    {(!node.hasSections || node.shape === "rectangle" || node.shape === "rounded") && (
                                        <svg width={node.width} height={node.height} className="absolute inset-0">{renderShape(node)}</svg>
                                    )}

                                    {/* Bölümsüz mod: Normal içerik */}
                                    {!node.hasSections && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center p-3 overflow-hidden" style={{ color: s.textColor, fontSize: s.fontSize, fontWeight: s.fontWeight, textAlign: s.textAlign }}>
                                            <div className="font-medium w-full text-center">{node.title}</div>
                                            {node.description && <div className="text-xs opacity-70 w-full text-center mt-1">{node.description}</div>}
                                        </div>
                                    )}

                                    {/* Bölümlü mod: Stack görünümü */}
                                    {node.hasSections && node.sections?.length > 0 && (
                                        <div className="absolute inset-0 flex flex-col overflow-hidden rounded-lg" style={{ border: `${s.strokeWidth}px solid ${s.strokeColor}` }}>
                                            {/* Başlık bölümü */}
                                            <div className="flex items-center justify-center px-3 py-2" style={{ backgroundColor: s.fillColor, color: s.textColor, minHeight: headerHeight > 20 ? headerHeight : 36 }}>
                                                <span className="font-medium text-sm">{node.title}</span>
                                            </div>
                                            {/* Alt bölümler */}
                                            {node.sections.map((sec) => (
                                                <div key={sec.id} className="flex items-center px-3 border-t" style={{ backgroundColor: sec.bgColor, color: sec.textColor, height: sec.height || 32, borderColor: s.strokeColor }}>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-xs font-medium truncate">{sec.title}</div>
                                                        {sec.content && <div className="text-[10px] opacity-70 truncate">{sec.content}</div>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {/* Seçim kutusu */}
                    {selectionBox && (
                        <div className="absolute pointer-events-none border border-[#13a4ec] bg-[#13a4ec]/10" style={{ left: Math.min(selectionBox.startX, selectionBox.endX), top: Math.min(selectionBox.startY, selectionBox.endY), width: Math.abs(selectionBox.endX - selectionBox.startX), height: Math.abs(selectionBox.endY - selectionBox.startY) }} />
                    )}

                    {/* Context Menu (Sağ Tık Menüsü) */}
                    {contextMenu && (
                        <div className="fixed rounded-lg border border-[#283339] bg-[#1a252b] shadow-2xl z-50 py-1 min-w-[160px]" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
                            {contextMenu.type === 'node' ? (
                                <>
                                    <button onClick={handleCopy} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#283339] flex items-center gap-2">
                                        <span>⎘</span> Copy <span className="ml-auto text-slate-500">Ctrl+C</span>
                                    </button>
                                    <button onClick={() => handlePaste()} disabled={clipboard.length === 0} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#283339] flex items-center gap-2 disabled:opacity-40">
                                        <span>⎙</span> Paste <span className="ml-auto text-slate-500">Ctrl+V</span>
                                    </button>
                                    <button onClick={handleDuplicate} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#283339] flex items-center gap-2">
                                        <span>⧉</span> Duplicate <span className="ml-auto text-slate-500">Ctrl+D</span>
                                    </button>
                                    <div className="border-t border-[#283339] my-1" />
                                    <button onClick={handleContextDelete} className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2">
                                        <span>✕</span> Delete <span className="ml-auto text-slate-500">Delete</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => handlePaste({ x: contextMenu.canvasX, y: contextMenu.canvasY })} disabled={clipboard.length === 0} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#283339] flex items-center gap-2 disabled:opacity-40">
                                        <span>⎙</span> Paste Here <span className="ml-auto text-slate-500">Ctrl+V</span>
                                    </button>
                                    <div className="border-t border-[#283339] my-1" />
                                    {shapeTypes.slice(0, 4).map(shape => (
                                        <button key={shape.id} onClick={() => { handleAddShape(shape.id, { clientX: contextMenu.x, clientY: contextMenu.y }); closeContextMenu(); }} className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-[#283339] flex items-center gap-2">
                                            <span>{shape.icon}</span> {shape.label} Add
                                        </button>
                                    ))}
                                </>
                            )}
                        </div>
                    )}

                    {/* Alt araç çubuğu */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-10 px-4 py-2 rounded-2xl">
                        <div className="flex items-center gap-1 backdrop-blur-xl border rounded-xl p-1 shadow-xl" style={{ backgroundColor: 'var(--panel-bg)', borderColor: 'var(--panel-border)' }}>
                            <button onClick={() => setZoom(z => Math.max(25, z - 10))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors">−</button>
                            <span className="text-xs w-10 text-center font-medium text-slate-300">{zoom}%</span>
                            <button onClick={() => setZoom(z => Math.min(200, z + 10))} className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white rounded-lg transition-colors">+</button>
                        </div>
                        {mode === "connect" && <div className="bg-amber-500/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg border border-amber-400/20 shadow-lg font-medium">{connectFromId ? "Select target" : "Select source"}</div>}
                        {shapeToAdd && <div className="bg-green-500/90 backdrop-blur text-white text-xs px-3 py-1.5 rounded-lg border border-green-400/20 shadow-lg font-medium">Click on canvas: {shapeTypes.find(s => s.id === shapeToAdd)?.label}</div>}
                    </div>
                </div>

                {/* Sağ Panel */}
                <div className="w-80 border-l flex flex-col overflow-hidden shrink-0 backdrop-blur-sm" style={{ backgroundColor: 'var(--frame-bg)', borderColor: 'var(--frame-border)' }}>
                    <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-white tracking-wide">Properties</h3>
                            <button onClick={handleDeleteSelected} disabled={selectedIds.size === 0 && !selectedConnectionId} className="text-slate-400 hover:text-red-400 transition-colors disabled:opacity-0">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{selectedIds.size > 1 ? `${selectedIds.size} items selected` : singleSelectedNode?.title || (selectedConnectionId ? "Connection selected" : "No selection")}</p>
                    </div>

                    <div className="flex bg-black/20 mx-3 mt-3 rounded-lg border border-white/5 p-1">
                        {["style", "sections"].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 text-xs py-1.5 rounded-md transition-all font-medium ${activeTab === tab ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"}`}>{tab === "style" ? "Style" : "Sections"}</button>
                        ))}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                        {selectedIds.size === 0 && !selectedConnectionId && (
                            <div className="flex flex-col items-center justify-center h-48 text-slate-500 border-2 border-dashed border-white/5 rounded-xl m-2 bg-white/5">
                                <svg className="w-8 h-8 opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2z" /></svg>
                                <p className="text-xs">Select an item to edit</p>
                            </div>
                        )}

                        {selectedIds.size > 0 && activeTab === "style" && (
                            <>
                                {singleSelectedNode && (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Title</label>
                                            <input value={singleSelectedNode.title} onChange={(e) => updateSelectedNodes({ title: e.target.value })} className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors" />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 block">Description</label>
                                            <textarea value={singleSelectedNode.description || ""} onChange={(e) => updateSelectedNodes({ description: e.target.value })} rows={3} className="w-full px-3 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:border-blue-500/50 transition-colors" />
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 pb-1">Appearance</div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div><label className="text-[10px] text-slate-500 mb-1 block">Fill Color</label><div className="h-9 rounded-lg border border-white/10 overflow-hidden relative"><input type="color" value={singleSelectedNode?.style?.fillColor || defaultNodeStyle.fillColor} onChange={(e) => updateNodeStyle({ fillColor: e.target.value })} className="absolute inset-[-4px] w-[120%] h-[120%] cursor-pointer p-0 border-0" /></div></div>
                                        <div><label className="text-[10px] text-slate-500 mb-1 block">Stroke Color</label><div className="h-9 rounded-lg border border-white/10 overflow-hidden relative"><input type="color" value={singleSelectedNode?.style?.strokeColor || defaultNodeStyle.strokeColor} onChange={(e) => updateNodeStyle({ strokeColor: e.target.value })} className="absolute inset-[-4px] w-[120%] h-[120%] cursor-pointer p-0 border-0" /></div></div>
                                        <div><label className="text-[10px] text-slate-500 mb-1 block">Text Color</label><div className="h-9 rounded-lg border border-white/10 overflow-hidden relative"><input type="color" value={singleSelectedNode?.style?.textColor || defaultNodeStyle.textColor} onChange={(e) => updateNodeStyle({ textColor: e.target.value })} className="absolute inset-[-4px] w-[120%] h-[120%] cursor-pointer p-0 border-0" /></div></div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Stroke Width</label>
                                            <div className="relative">
                                                <input type="number" min="0" max="10" value={singleSelectedNode?.style?.strokeWidth || defaultNodeStyle.strokeWidth} onChange={(e) => updateNodeStyle({ strokeWidth: Number(e.target.value) })} className="w-full h-9 pl-3 pr-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500/50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-white/5 pb-1">Dimensions</div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Width</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-3 text-slate-500 text-xs">W</span>
                                                <input type="number" value={singleSelectedNode?.width || 180} onChange={(e) => updateSelectedNodes({ width: Number(e.target.value) })} className="w-full h-9 pl-8 pr-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500/50" />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 mb-1 block">Height</label>
                                            <div className="relative flex items-center">
                                                <span className="absolute left-3 text-slate-500 text-xs">H</span>
                                                <input type="number" value={singleSelectedNode?.height || 100} onChange={(e) => updateSelectedNodes({ height: Number(e.target.value) })} className="w-full h-9 pl-8 pr-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs focus:outline-none focus:border-blue-500/50" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Font Size</label> <span className="text-[10px] text-slate-400">{singleSelectedNode?.style?.fontSize || 14}px</span></div>
                                    <input type="range" min="10" max="32" value={singleSelectedNode?.style?.fontSize || 14} onChange={(e) => updateNodeStyle({ fontSize: Number(e.target.value) })} className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                </div>

                                <div>
                                    <div className="flex justify-between mb-1"><label className="text-[10px] text-slate-500">Opacity</label> <span className="text-[10px] text-slate-400">{Math.round((singleSelectedNode?.style?.opacity || 1) * 100)}%</span></div>
                                    <input type="range" min="20" max="100" value={(singleSelectedNode?.style?.opacity || 1) * 100} onChange={(e) => updateNodeStyle({ opacity: Number(e.target.value) / 100 })} className="w-full accent-blue-500 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
                                </div>

                                {singleSelectedNode && (
                                    <div><label className="text-[10px] text-slate-500 uppercase">Shape</label>
                                        <select value={singleSelectedNode.shape} onChange={(e) => updateSelectedNodes({ shape: e.target.value })} className="w-full mt-1 px-2 py-1.5 bg-[#1a252b] border border-[#283339] rounded text-white text-xs">
                                            {shapeTypes.map(s => <option key={s.id} value={s.id}>{s.icon} {s.label}</option>)}
                                        </select>
                                    </div>
                                )}
                            </>
                        )}

                        {singleSelectedNode && activeTab === "sections" && (
                            <>
                                {/* Bölüm modu toggle */}
                                <div className="flex items-center justify-between p-2 bg-[#1a252b] rounded border border-[#283339]">
                                    <span className="text-xs text-slate-300">Section View</span>
                                    <button onClick={toggleSectionMode} className={`w-10 h-5 rounded-full relative transition-colors ${singleSelectedNode.hasSections ? 'bg-[#13a4ec]' : 'bg-[#283339]'}`}>
                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${singleSelectedNode.hasSections ? 'left-5' : 'left-0.5'}`} />
                                    </button>
                                </div>

                                {singleSelectedNode.hasSections && (
                                    <>
                                        <button onClick={addSection} className="w-full py-1.5 text-xs bg-[#13a4ec] text-white rounded hover:bg-[#13a4ec]/80">+ Add Section</button>

                                        <div className="space-y-2">
                                            {singleSelectedNode.sections?.map((sec, idx) => (
                                                <div key={sec.id} className="p-2 bg-[#1a252b] rounded border border-[#283339] space-y-2">
                                                    {/* Başlık ve kontroller */}
                                                    <div className="flex items-center gap-1">
                                                        <input value={sec.title} onChange={(e) => updateSection(sec.id, { title: e.target.value })} placeholder="Title" className="flex-1 px-2 py-1 text-xs bg-[#101c22] border border-[#283339] rounded text-white" />
                                                        <button onClick={() => moveSectionUp(sec.id)} disabled={idx === 0} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">↑</button>
                                                        <button onClick={() => moveSectionDown(sec.id)} disabled={idx === singleSelectedNode.sections.length - 1} className="p-1 text-slate-400 hover:text-white disabled:opacity-30">↓</button>
                                                        <button onClick={() => removeSection(sec.id)} className="p-1 text-rose-400 hover:text-rose-300">✕</button>
                                                    </div>

                                                    {/* İçerik */}
                                                    <input value={sec.content || ""} onChange={(e) => updateSection(sec.id, { content: e.target.value })} placeholder="Content (optional)" className="w-full px-2 py-1 text-[10px] bg-[#101c22] border border-[#283339] rounded text-white" />

                                                    {/* Stiller */}
                                                    <div className="flex gap-2">
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-500">Background</label>
                                                            <input type="color" value={sec.bgColor || "#283339"} onChange={(e) => updateSection(sec.id, { bgColor: e.target.value })} className="w-full h-6 rounded border border-[#283339] cursor-pointer" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-500">Text</label>
                                                            <input type="color" value={sec.textColor || "#ffffff"} onChange={(e) => updateSection(sec.id, { textColor: e.target.value })} className="w-full h-6 rounded border border-[#283339] cursor-pointer" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <label className="text-[9px] text-slate-500">Height</label>
                                                            <input type="number" min="24" max="80" value={sec.height || 32} onChange={(e) => updateSection(sec.id, { height: Number(e.target.value) })} className="w-full h-6 px-1 text-[10px] bg-[#101c22] border border-[#283339] rounded text-white" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {(!singleSelectedNode.sections || singleSelectedNode.sections.length === 0) && (
                                            <p className="text-xs text-slate-500 text-center py-2">No sections yet</p>
                                        )}
                                    </>
                                )}

                                {!singleSelectedNode.hasSections && (
                                    <p className="text-xs text-slate-500">Enable section view to split item into subsections.</p>
                                )}
                            </>
                        )}

                        {selectedConnectionId && activeProject?.connections && (
                            <div className="space-y-3">
                                <div><label className="text-[10px] text-slate-500 uppercase">Connection Label</label><input value={activeProject.connections.find(c => c.id === selectedConnectionId)?.label || ""} onChange={(e) => updateProject(p => ({ ...p, connections: p.connections.map(c => c.id === selectedConnectionId ? { ...c, label: e.target.value } : c) }))} className="w-full mt-1 px-2 py-1 text-sm bg-[#1a252b] border border-[#283339] rounded text-white" /></div>
                                <div className="flex items-center gap-2"><input type="checkbox" checked={activeProject.connections.find(c => c.id === selectedConnectionId)?.style?.dashed || false} onChange={(e) => updateProject(p => ({ ...p, connections: p.connections.map(c => c.id === selectedConnectionId ? { ...c, style: { ...c.style, dashed: e.target.checked } } : c) }))} className="rounded border-[#283339]" /><span className="text-xs text-slate-400">Dashed line</span></div>
                            </div>
                        )}
                    </div>

                    {/* Katmanlar */}
                    <div className="h-48 border-t border-[#283339] flex flex-col shrink-0">
                        <div className="p-2 border-b border-[#283339] text-xs font-medium flex justify-between items-center">
                            <span>Layers ({activeProject?.nodes?.length || 0})</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-1">
                            {activeProject?.nodes?.map(node => (
                                <div key={node.id} onClick={() => setSelectedIds(new Set([node.id]))} className={`flex items-center gap-2 px-2 py-1 rounded text-xs cursor-pointer ${selectedIds.has(node.id) ? "bg-[#13a4ec]/20 text-[#13a4ec]" : "text-slate-300 hover:bg-[#283339]/50"}`}>
                                    <span style={{ color: node.style?.strokeColor || "#13a4ec" }}>{shapeTypes.find(s => s.id === node.shape)?.icon || "□"}</span>
                                    <span className="truncate flex-1">{node.title}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectCanvas;
