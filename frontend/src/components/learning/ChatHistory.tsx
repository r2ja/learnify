import { FC } from 'react';
import { Clock } from 'lucide-react';

interface Chat {
  id: number | string;
  title: string;
  date: string;
}

interface ChatHistoryProps {
  chats: Chat[];
}

export const ChatHistory: FC<ChatHistoryProps> = ({ chats }) => {
  return (
    <div className="p-6 h-full flex flex-col">
      <h2 className="text-xl font-semibold text-white mb-6 pb-4 border-b border-white/10">Chat History</h2>
      <div className="flex-1 overflow-y-auto flex flex-col gap-1 pr-2">
        {chats.map((chat) => (
          <button key={chat.id} className="text-left py-4 px-4 rounded-lg transition-all duration-200 border-b border-white/5 hover:bg-white/5 hover:translate-x-1">
            <div className="flex flex-col gap-2">
              <h3 className="text-base font-medium text-white">{chat.title}</h3>
              <div className="flex items-center gap-1.5 text-xs text-white/60">
                <Clock size={14} />
                <span>{new Date(chat.date).toLocaleDateString()}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChatHistory; 