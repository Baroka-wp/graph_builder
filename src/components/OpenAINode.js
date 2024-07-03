import React, { useEffect, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { neumorphicStyle } from './styles';
import OpenAI from 'openai';

const OpenAINode = ({ data, isConnectable }) => {
  const callOpenAI = useCallback(async () => {
    if (!data.userMessage) return;

    data.setLoading(true);
    try {
      const openai = new OpenAI({ apiKey: data.apiKey, dangerouslyAllowBrowser: true });
      const completion = await openai.chat.completions.create({
        messages: [
          { role: "system", content: data.prompt },
          { role: "user", content: data.userMessage }
        ],
        model: data.model,
        max_tokens: 150, // Limiter la longueur de la réponse
        temperature: 0.7, // Ajuster pour un équilibre entre créativité et cohérence
      });
      const responseText = completion.choices[0].message.content;
      data.onApiResponse(responseText);
    } catch (error) {
      console.error("OpenAI API error:", error);
      if (data.onApiError) {
        data.onApiError(error);
      } else {
        data.onApiResponse(`Error: ${error.message}`);
      }
    } finally {
      data.setLoading(false);
    }
  }, [data]);

  useEffect(() => {
    if (data.triggerExecution) {
      callOpenAI();
    }
  }, [data.triggerExecution, callOpenAI]);

  return (
    <div style={{
      ...neumorphicStyle,
      padding: '15px',
      minWidth: '200px',
      maxWidth: '400px',
      wordWrap: 'break-word',
    }}>
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} />
      <div style={{ marginBottom: '10px', fontWeight: 'bold', color: '#3498db' }}>Ask AI</div>
      <div>
        <label>Prompt (System):</label>
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
            border: 'none',
            background: 'transparent',
          }}
        >
          <option value="gpt-4">gpt-4</option>
          <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
          <option value="gpt-4o">gpt-4o</option>
        </select>
      </div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} />
    </div>
  );
};

export default OpenAINode;
