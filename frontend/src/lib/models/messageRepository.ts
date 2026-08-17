import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../db';
import { 
  Message, 
  MessageCreateInput, 
  MessageUpdateInput,
  MessageWithRelations
} from './types';

export const messageRepository = {
  // Basic implementation to be expanded as needed
  
  /**
   * Find all messages for a chat
   */
  async findMany({ 
    where 
  }: { 
    where: { chatId: string } 
  }): Promise<Message[]> {
    const sql = `
      SELECT *
      FROM "Message"
      WHERE "chatId" = $1
      ORDER BY "createdAt" ASC
    `;
    
    return await query<Message>(sql, [where.chatId]);
  },

  /**
   * Create a new message
   */
  async create({ 
    data 
  }: { 
    data: MessageCreateInput 
  }): Promise<Message> {
    const id = uuidv4();
    const now = new Date();
    
    const fields = Object.keys(data) as Array<keyof MessageCreateInput>;
    const placeholders = fields.map((_, i) => `$${i + 4}`);
    const values = fields.map(field => data[field]);
    
    const sql = `
      INSERT INTO "Message" (
        "id", 
        "createdAt", 
        "updatedAt",
        ${fields.map(f => `"${f}"`).join(', ')}
      )
      VALUES (
        $1, $2, $3, ${placeholders.join(', ')}
      )
      RETURNING *
    `;
    
    const messages = await query<Message>(sql, [id, now, now, ...values]);
    return messages[0];
  }
}; 