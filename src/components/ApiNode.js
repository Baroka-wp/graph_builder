import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { neumorphicStyle } from './styles';

const ApiNode = ({ data, isConnectable }) => {
  const [apiResponse, setApiResponse] = useState('');

  const callApi = async () => {
    try {
      const response = await fetch(data.apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${data.token}`,
        },
      });
      const result = await response.json();
      setApiResponse(JSON.stringify(result, null, 2));
      if (data.onApiResponse) {
        data.onApiResponse(result);
      }
    } catch (error) {
      setApiResponse(`Error: ${error.message}`);
    }
  };

  return (
    <div style={{ 
      ...neumorphicStyle,
      padding: '15px', 
      minWidth: '150px',
      maxWidth: '300px',
      wordWrap: 'break-word',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#3498db' }}>API Node</div>
      <button onClick={callApi} style={{ ...neumorphicStyle, padding: '10px', cursor: 'pointer' }}>Call API</button>
      <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{apiResponse}</pre>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default ApiNode;
