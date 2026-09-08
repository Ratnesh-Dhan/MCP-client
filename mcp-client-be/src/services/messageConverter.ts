import { AIMessage, HumanMessage, ToolMessage } from "@langchain/core/messages";
import { Message } from "../types/allTypes.js";

export function toLangChainMessage(message: Message) {
  switch (message.role) {
    case "user":
      return new HumanMessage(message.content);

    case "assistant":
      return new AIMessage({
        content: message.content,
        tool_calls: message.tool_calls,
      });

    case "tool":
      return new ToolMessage({
        content: message.content,
        tool_call_id: message.tool_call_id!,
        name: message.name,
      });
  }
}
