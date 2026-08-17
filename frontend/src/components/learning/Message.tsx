import { FC } from 'react';

interface MessageProps {
  content: string;
  isUser: boolean;
  accentColor?: string;
}

export const Message: FC<MessageProps> = ({ 
  content, 
  isUser, 
  accentColor = 'var(--primary)' 
}) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-md bg-[var(--primary)] text-white flex items-center justify-center mr-3 mt-0.5">
          <span className="text-sm font-semibold">L</span>
        </div>
      )}
      
      <div 
        className={`relative max-w-[70%] py-3 px-4 rounded-lg ${
          isUser 
            ? 'bg-[var(--primary)] text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        <div className="text-sm whitespace-pre-wrap">{content}</div>
      </div>
      
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center ml-3 mt-0.5">
          <span className="text-sm font-semibold">U</span>
        </div>
      )}
    </div>
  );
};

export default Message; 