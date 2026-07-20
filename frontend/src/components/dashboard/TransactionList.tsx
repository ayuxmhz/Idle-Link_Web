import { Download, Upload } from "lucide-react";

export interface TransactionViewModel {
  type: string;
  details: string;
  amount: string;
  positive: boolean;
}

interface TransactionListProps {
  transactions?: TransactionViewModel[];
}

export default function TransactionList({ transactions = [] }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl flex flex-col h-full">
        <div className="p-6 pb-4">
          <h3 className="text-white font-bold">Recent Transactions</h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-center px-6 pb-6">
          <p className="text-gray-500 text-sm">No transactions yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#16171f] border border-[#2a2b36] rounded-xl flex flex-col h-full">
      <div className="p-6 pb-4">
        <h3 className="text-white font-bold">Recent Transactions</h3>
      </div>

      <div className="flex-1 flex flex-col">
        {transactions.map((tx, i) => (
          <div 
            key={i} 
            className={`px-6 py-4 flex items-center justify-between ${
              i !== transactions.length - 1 ? 'border-b border-[#2a2b36]' : ''
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#2a2b36]/50 flex items-center justify-center text-gray-400">
                {tx.positive ? <Download size={16} /> : <Upload size={16} />}
              </div>
              <div>
                <p className="text-sm text-white font-medium">{tx.type}</p>
                <p className="text-xs text-gray-500">{tx.details}</p>
              </div>
            </div>
            <span className={`text-sm font-mono ${tx.positive ? 'text-[#cbbefa]' : 'text-gray-300'}`}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
