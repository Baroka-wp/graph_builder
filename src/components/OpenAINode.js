// OpenAINode.js
import React from 'react';
import { Handle, Position } from 'reactflow';
import { neumorphicStyle } from './styles';

const OpenAINode = ({ data, isConnectable }) => {
  return (
    <div style={{ 
      ...neumorphicStyle,
      padding: '15px', 
      minWidth: '200px',
      maxWidth: '400px',
      wordWrap: 'break-word',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#3498db' }}>OpenAI Node</div>
      <div>
        <label>Prompt:</label>
        <textarea
          value={data.prompt}
          onChange={(evt) => data.onPromptChange(evt.target.value)}
          style={{
            width: '100%',
            border: 'none',
            background: 'transparent',
            resize: 'vertical',
            minHeight: '50px',
          }}
        />
      </div>
      <div>
        <label>Model:</label>
        <select
          value={data.model}
          onChange={(evt) => data.onModelChange(evt.target.value)}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '5px',
          }}
        >
          <option value="gpt-4o">GPT-4o</option>
          <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
          <option value="gpt-4">GPT-4</option>
        </select>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default OpenAINode;