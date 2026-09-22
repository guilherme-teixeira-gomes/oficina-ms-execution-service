import { Schema, model, Document } from "mongoose";

/**
 * Documento de Execução (MongoDB / NoSQL).
 *
 * O Execution Service usa banco NÃO relacional porque o documento de execução
 * é naturalmente flexível: cada OS pode ter uma quantidade variável de itens
 * de reparo, notas e etapas, sem esquema rígido. Isso cumpre o requisito da
 * Fase 4 de usar pelo menos um banco NoSQL.
 */
export interface IExecutionItem {
  descricao: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDO";
  notaMecanico?: string;
}

export interface IExecution extends Document {
  orderId: number;
  sagaId: string;
  status: "NA_FILA" | "EM_EXECUCAO" | "FINALIZADA" | "FALHOU";
  items: IExecutionItem[];
  startedAt?: Date;
  finishedAt?: Date;
  createdAt: Date;
}

const ExecutionItemSchema = new Schema<IExecutionItem>({
  descricao: { type: String, required: true },
  status: { type: String, enum: ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO"], default: "PENDENTE" },
  notaMecanico: { type: String },
}, { _id: false });

const ExecutionSchema = new Schema<IExecution>({
  orderId: { type: Number, required: true, index: true },
  sagaId: { type: String, required: true },
  status: { type: String, enum: ["NA_FILA", "EM_EXECUCAO", "FINALIZADA", "FALHOU"], default: "NA_FILA" },
  items: { type: [ExecutionItemSchema], default: [] },
  startedAt: { type: Date },
  finishedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export const ExecutionModel = model<IExecution>("Execution", ExecutionSchema);
