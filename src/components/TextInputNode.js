import React from 'react';
import { Handle, Position } from 'reactflow';
import { neumorphicStyle } from './styles';

const TextInputNode = ({ data, isConnectable }) => {
  return (
    <div style={{ 
      ...neumorphicStyle,
      padding: '15px', 
      minWidth: '150px',
      maxWidth: '300px'
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#3498db' }}>Text Input</div>
      <textarea
        value={data.label}
        onChange={(evt) => data.onLabelChange(evt.target.value)}
        style={{
          width: '100%',
          border: 'none',
          background: 'transparent',
          resize: 'vertical',
          minHeight: '50px',
        }}
      />
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default TextInputNode;