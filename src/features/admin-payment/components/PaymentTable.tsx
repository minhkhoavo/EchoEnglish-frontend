import { Badge } from '@/components/ui/badge';
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { Payment, PaymentStatus } from '../types/payment.types';
import { formatCurrency, formatDateWithSeconds } from '@/lib/format';

interface PaymentTableProps {
  data: Payment[];
}

export const PaymentTable = ({ data }: PaymentTableProps) => {
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCEEDED':
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Succeeded
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Expired
          </Badge>
        );
      case 'INITIATED':
        return (
          <Badge className="bg-blue-100 text-blue-700 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Initiated
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-purple-100 text-purple-700 flex items-center gap-1 w-fit">
            <Wallet className="w-3.5 h-3.5" /> Pending
          </Badge>
        );
      case 'CANCELED':
        return (
          <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
            <XCircle className="w-3.5 h-3.5" /> Canceled
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 flex items-center gap-1 w-fit">
            {status}
          </Badge>
        );
    }
  };

  const getTypeIcon = (type: string) => {
    if (type === 'purchase')
      return <ArrowUpCircle className="text-blue-500 w-4 h-4" />;
    if (type === 'deduction')
      return <ArrowDownCircle className="text-orange-500 w-4 h-4" />;
    return <Wallet className="text-gray-400 w-4 h-4" />;
  };

  return (
    <div className="border rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-700">
            <tr>
              <th className="p-3 text-left font-semibold">Time</th>
              <th className="p-3 text-left font-semibold">User</th>
              <th className="p-3 text-left font-semibold">Type</th>
              <th className="p-3 text-left font-semibold">Amount</th>
              <th className="p-3 text-left font-semibold">Tokens</th>
              <th className="p-3 text-left font-semibold">Status</th>
              <th className="p-3 text-left font-semibold">Gateway</th>
              <th className="p-3 text-left font-semibold">Description</th>
            </tr>
          </thead>
          <tbody>
            {!data || data.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-6 text-gray-500 italic"
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              data.map((tx) => (
                <tr
                  key={tx._id}
                  className="border-t hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 text-gray-700">
                    {formatDateWithSeconds(tx.createdAt)}
                  </td>
                  <td className="p-3 text-gray-700">
                    {typeof tx.user === 'string'
                      ? tx.user
                      : tx.user?.email || '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2 capitalize text-gray-800">
                      {getTypeIcon(tx.type)}
                      {tx.type}
                    </div>
                  </td>
                  <td className="p-3 font-medium text-gray-900">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="p-3 font-medium">{tx.tokens}</td>
                  <td className="p-3">{getStatusBadge(tx.status)}</td>
                  <td className="p-3 text-gray-700">{tx.paymentGateway}</td>
                  <td className="p-3 text-gray-600">{tx.description || '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
