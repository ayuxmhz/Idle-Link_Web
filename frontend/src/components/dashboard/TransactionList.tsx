import { Download, Upload } from "lucide-react";

export default function TransactionList() {
  const transactions = [
    {
      type: "Job Payment",
      details: "Instance #4492",
      amount: "+NPR 1,200",
      positive: true,
      icon: <Download size={16} />
    },
    {
      type: "Job Payment",
      details: "Instance #4491",
      amount: "+NPR 850",
      positive: true,
      icon: <Download size={16} />
    },
    {
      type: "Withdrawal",
      details: "To Bank Account",
      amount: "-NPR 5,000",
      positive: false,
      icon: <Upload size={16} />
    }
  ];

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
                {tx.icon}
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
