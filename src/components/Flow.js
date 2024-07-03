import React, { useState, useCallback, useRef, useEffect } from 'react';
import { IoSend, IoRefresh } from 'react-icons/io5';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import TextInputNode from './TextInputNode';
import StartNode from './StartNode';
import ApiNode from './ApiNode';
import OpenAINode from './OpenAINode';
import { neumorphicStyle } from './styles';
import { TailSpin } from 'react-loader-spinner'; // Importing the loader

const nodeTypes = {
    textInput: TextInputNode,
    startNode: StartNode,
    apiNode: ApiNode,
    openAINode: OpenAINode,
};

const initialNodes = [
    {
        id: 'start',
        type: 'startNode',
        position: { x: 250, y: 5 },
        data: {}
    },
];

function Flow() {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [contextMenu, setContextMenu] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [currentNodeId, setCurrentNodeId] = useState('start');
    const [userInput, setUserInput] = useState('');
    const [loading, setLoading] = useState(false); // Global loading state
    const reactFlowWrapper = useRef(null);
    const chatMessagesRef = useRef(null);

    useEffect(() => {
        const savedNodes = localStorage.getItem('flowNodes');
        const savedEdges = localStorage.getItem('flowEdges');
        if (savedNodes && savedEdges) {
            setNodes(JSON.parse(savedNodes));
            setEdges(JSON.parse(savedEdges));
        }
    }, [setNodes, setEdges]);

    useEffect(() => {
        if (nodes.length > 0) {
            localStorage.setItem('flowNodes', JSON.stringify(nodes));
        }
    }, [nodes]);

    useEffect(() => {
        if (nodes.length > 0) {
            localStorage.setItem('flowEdges', JSON.stringify(edges));
        }
    }, [edges]);

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), []);

    const handleApiError = useCallback((error) => {
        console.error("API Error:", error);
        setChatMessages(prev => [...prev, { type: 'agent', text: "Sorry, there was an error processing your request." }]);
        setLoading(false);
    }, []);

    const updateNodeData = useCallback((nodeId, field, value) => {
        setNodes(nds => nds.map(node =>
            node.id === nodeId
                ? { ...node, data: { ...node.data, [field]: value } }
                : node
        ));
    }, []);

    const addNode = (type) => {
        const newNodeId = (nodes.length + 1).toString();
        const newNode = {
            id: newNodeId,
            type: type,
            position: {
                x: Math.random() * (reactFlowWrapper.current.offsetWidth - 200),
                y: Math.random() * (reactFlowWrapper.current.offsetHeight - 100)
            },
            data: type === 'openAINode' ? {
                prompt: '',
                apiKey: process.env.REACT_APP_OPENAI_API_KEY,
                model: 'gpt-3.5-turbo',
                onPromptChange: (newPrompt) => updateNodeData(newNodeId, 'prompt', newPrompt),
                onModelChange: (newModel) => updateNodeData(newNodeId, 'model', newModel),
                onApiResponse: (response) => {
                    setChatMessages(prev => [...prev, { type: 'agent', text: response }]);
                    setLoading(false);
                    const nextNode = getNextNode();
                    if (nextNode) {
                        setCurrentNodeId(nextNode.id);
                        if (nextNode.type === 'openAINode') {
                            updateNodeData(nextNode.id, 'userMessage', response);
                            updateNodeData(nextNode.id, 'triggerExecution', true);
                        } else {
                            setChatMessages(prev => [...prev, { type: 'agent', text: nextNode.data.label }]);
                        }
                    }
                },
                setLoading: setLoading, // Assurez-vous que cette ligne est présente
                setChatMessages: setChatMessages,
                onApiError: handleApiError,
            } : {
                label: `New message ${nodes.length + 1}`,
                onChange: (newLabel) => updateNodeData(newNodeId, 'label', newLabel),
            }
        };
        setNodes((nds) => nds.concat(newNode));
    };

    const onNodeContextMenu = useCallback(
        (event, node) => {
            event.preventDefault();
            const pane = reactFlowWrapper.current.getBoundingClientRect();
            setContextMenu({
                id: node.id,
                top: event.clientY - pane.top,
                left: event.clientX - pane.left,
            });
        },
        []
    );

    const onPaneClick = useCallback(() => setContextMenu(null), []);

    const deleteNode = useCallback(
        (id) => {
            setNodes((nds) => nds.filter((node) => node.id !== id));
            setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
            setContextMenu(null);
            if (currentNodeId === id) {
                const remainingNodes = nodes.filter((node) => node.id !== id);
                setCurrentNodeId(remainingNodes.length > 0 ? remainingNodes[0].id : null);
            }
        },
        [nodes, currentNodeId, setNodes, setEdges]
    );

    const getNextNode = useCallback(() => {
        const currentEdge = edges.find(edge => edge.source === currentNodeId);
        if (currentEdge) {
            const nextNode = nodes.find(node => node.id === currentEdge.target);
            return nextNode;
        }
        return null;
    }, [currentNodeId, edges, nodes]);

    const handleUserInput = () => {
        if (userInput.trim() === '') return;

        setChatMessages(prev => [...prev, { type: 'user', text: userInput }]);

        const nextNode = getNextNode();
        if (nextNode) {
            if (nextNode.type === 'openAINode') {
                setLoading(true);
                nextNode.data.userMessage = userInput;
                nextNode.data.triggerExecution = true;
                setCurrentNodeId(nextNode.id);
            } else {
                setChatMessages(prev => [...prev, { type: 'agent', text: nextNode.data.label }]);
                setCurrentNodeId(nextNode.id);
            }
        }

        setUserInput('');
    };

    const restartChat = () => {
        setChatMessages([]);
        setNodes(initialNodes);
        setEdges([]);
        setCurrentNodeId('start');
        localStorage.removeItem('nodes');
        localStorage.removeItem('edges');
    };

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages]);

    return (
        <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#e0e5ec', overflow: 'hidden' }}>
            <div style={{ width: '65%', height: '100%', position: 'relative' }} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={nodeTypes}
                    onNodeContextMenu={onNodeContextMenu}
                    onPaneClick={onPaneClick}
                >
                    <Background color="#c9d6e5" />
                    <Controls />
                </ReactFlow>
                <button
                    onClick={() => addNode('textInput')}
                    style={{
                        ...neumorphicStyle,
                        position: 'absolute',
                        left: '10px',
                        top: '10px',
                        padding: '10px 15px',
                        cursor: 'pointer',
                        zIndex: 4,
                    }}
                >
                    Add Input Node
                </button>
                <button
                    onClick={() => addNode('apiNode')}
                    style={{
                        ...neumorphicStyle,
                        position: 'absolute',
                        left: '150px',
                        top: '10px',
                        padding: '10px 15px',
                        cursor: 'pointer',
                        zIndex: 4,
                    }}
                >
                    Add API Node
                </button>
                <button
                    onClick={() => addNode('openAINode')}
                    style={{
                        ...neumorphicStyle,
                        position: 'absolute',
                        left: '290px',
                        top: '10px',
                        padding: '10px 15px',
                        cursor: 'pointer',
                        zIndex: 4,
                    }}
                >
                    Add OpenAI Node
                </button>
                {contextMenu && (
                    <div
                        style={{
                            position: 'absolute',
                            top: `${contextMenu.top}px`,
                            left: `${contextMenu.left}px`,
                            zIndex: 1000,
                            ...neumorphicStyle,
                            padding: '5px',
                        }}
                    >
                        <button
                            onClick={() => deleteNode(contextMenu.id)}
                            style={{
                                ...neumorphicStyle,
                                padding: '8px 12px',
                                cursor: 'pointer',
                            }}
                        >
                            Delete Node
                        </button>
                    </div>
                )}
            </div>
            <div style={{
                width: '35%',
                height: '100%',
                borderLeft: '1px solid #c9d6e5',
                display: 'flex',
                flexDirection: 'column',
                ...neumorphicStyle,
                padding: 0,
            }}>
                <div ref={chatMessagesRef} style={{ flexGrow: 1, overflowY: 'auto', padding: '20px' }}>
                    {chatMessages.map((message, index) => (
                        <div key={index} style={{ marginBottom: '10px', textAlign: message.type === 'user' ? 'right' : 'left' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                ...neumorphicStyle,
                                backgroundColor: message.type === 'user' ? '#d4e6f1' : '#f0f0f0',
                                maxWidth: '80%'
                            }}>
                                {message.text}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '10px 15px',
                                borderRadius: '15px',
                                ...neumorphicStyle,
                                backgroundColor: '#f0f0f0',
                                maxWidth: '80%'
                            }}>
                                <TailSpin color="#3498db" height={30} width={30} />
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', padding: '10px' }}>
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleUserInput()}
                        style={{
                            flexGrow: 1,
                            marginRight: '10px',
                            padding: '10px',
                            ...neumorphicStyle,
                        }}
                    />
                    <button
                        onClick={handleUserInput}
                        style={{
                            ...neumorphicStyle,
                            padding: '10px 15px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IoSend style={{ marginRight: '5px' }} />
                    </button>
                    <button
                        onClick={restartChat}
                        style={{
                            ...neumorphicStyle,
                            padding: '10px 15px',
                            cursor: 'pointer',
                            marginLeft: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IoRefresh style={{ marginRight: '5px' }} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Flow;
