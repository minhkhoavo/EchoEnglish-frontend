import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import type { Transaction } from '../types';
import { TransactionType, PaymentMethod } from '../types';
import { TransactionStatusBadge } from './TransactionStatusBadge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import {
  CreditCard,
  ExternalLink,
  Calendar,
  Coins,
  TrendingUp,
  TrendingDown,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface PaymentHistoryTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
  error?: string | null;
  onPaymentContinue?: (transaction: Transaction) => void;
}

export const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  transactions,
  isLoading = false,
  error = null,
  onPaymentContinue,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';

      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch {
      return 'Unknown';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const getTransactionTypeInfo = (type: string) => {
    switch (type) {
      case TransactionType.PURCHASE:
        return {
          label: 'Purchase Credit',
          icon: <TrendingUp className="h-4 w-4 text-green-600" />,
          className: 'text-green-700',
        };
      case TransactionType.DEDUCTION:
        return {
          label: 'Use Credit',
          icon: <TrendingDown className="h-4 w-4 text-red-600" />,
          className: 'text-red-700',
        };
      default:
        return {
          label: 'Unknown',
          icon: <Coins className="h-4 w-4 text-gray-600" />,
          className: 'text-gray-700',
        };
    }
  };

  const getPaymentGatewayBadge = (gateway: string) => {
    switch (gateway) {
      case PaymentMethod.STRIPE:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            Stripe
          </Badge>
        );
      case PaymentMethod.VNPAY:
        return (
          <Badge
            variant="outline"
            className="bg-orange-50 text-orange-700 border-orange-200"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            VNPay
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-gray-50 text-gray-700 border-gray-200"
          >
            <CreditCard className="h-3 w-3 mr-1" />
            {gateway}
          </Badge>
        );
    }
  };

  const handleCopyTransactionId = async (transactionId: string) => {
    try {
      await navigator.clipboard.writeText(transactionId);
      setCopiedId(transactionId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const canContinuePayment = (transaction: Transaction) => {
    if (transaction.status !== 'INITIATED') return false;
    if (!transaction.expiredAt) return false;

    const now = new Date();
    const expiryDate = new Date(transaction.expiredAt);
    return now < expiryDate;
  };

  const handleContinuePayment = (transaction: Transaction) => {
    if (transaction.payUrl) {
      window.open(transaction.payUrl, '_blank');
    } else if (onPaymentContinue) {
      onPaymentContinue(transaction);
    }
  };

  if (isLoading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="h-5 w-5 text-gray-600" />
            <span className="text-gray-900">Transaction History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200"></div>
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent absolute top-0"></div>
            </div>
            <span className="ml-2 mt-4 text-gray-600 font-medium">
              Loading data...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Calendar className="h-5 w-5" />
            Error Loading Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!transactions.length) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-white/50 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-t-lg">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-gray-400 to-gray-600 rounded-lg">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-gray-900 to-blue-800 bg-clip-text text-transparent">
              Transaction History
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-12">
            <div className="mb-6">
              <div className="relative mx-auto w-20 h-20">
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full"></div>
                <Coins className="h-12 w-12 text-gray-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No transactions yet
            </h3>
            <p className="text-gray-500 mb-4 max-w-md mx-auto">
              Transaction history will appear here when you make purchases or
              use credits.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-gray-900">
            Transaction History ({transactions.length} transactions)
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-1.5">
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow className="bg-gradient-to-r from-gray-50/50 to-blue-50/50 hover:from-gray-100/50 hover:to-blue-100/50">
                <TableHead className="w-[100px] font-semibold text-gray-700">
                  Time
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Transaction ID
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Type
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700">
                  Amount
                </TableHead>
                <TableHead className="text-right font-semibold text-gray-700">
                  Credit
                </TableHead>
                <TableHead className="w-60 max-w-[220px] font-semibold text-gray-700">
                  Description
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-700">
                  Gateway
                </TableHead>
                <TableHead className="w-20 text-center font-semibold text-gray-700">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => {
                const typeInfo = getTransactionTypeInfo(transaction.type);
                return (
                  <TableRow
                    key={transaction._id}
                    className="hover:bg-gradient-to-r hover:from-blue-50/30 hover:to-indigo-50/30 transition-all duration-200 border-gray-100"
                  >
                    {/* Thời gian */}
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {formatDate(transaction.createdAt)}
                        </span>
                        {transaction.expiredAt &&
                          transaction.status === 'INITIATED' && (
                            <span className="text-xs text-gray-500">
                              Hết hạn: {formatDate(transaction.expiredAt)}
                            </span>
                          )}
                      </div>
                    </TableCell>

                    {/* Mã giao dịch */}
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {transaction._id.slice(-8)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCopyTransactionId(transaction._id)
                          }
                          className="h-6 w-6 p-0"
                        >
                          {copiedId === transaction._id ? (
                            <CheckCircle2 className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>

                    {/* Loại giao dịch */}
                    <TableCell>
                      <div
                        className={`flex items-center gap-2 ${typeInfo.className}`}
                      >
                        {typeInfo.icon}
                        <span className="font-medium">{typeInfo.label}</span>
                      </div>
                    </TableCell>

                    {/* Số tiền */}
                    <TableCell className="text-right">
                      {transaction.amount > 0 ? (
                        <div className="flex flex-col items-end">
                          <span className="font-medium">
                            {formatAmount(transaction.amount)}
                          </span>
                          {transaction.discount > 0 && (
                            <span className="text-xs text-green-600">
                              Giảm {formatAmount(transaction.discount)}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>

                    {/* Credit */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Coins className="h-4 w-4 text-yellow-600" />
                        <span
                          className={`font-medium ${
                            transaction.type === TransactionType.PURCHASE
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {transaction.type === TransactionType.PURCHASE
                            ? '+'
                            : '-'}
                          {transaction.tokens}
                        </span>
                      </div>
                    </TableCell>

                    {/* Mô tả */}
                    <TableCell className="w-44 max-w-[180px]">
                      <div className="overflow-hidden">
                        <p
                          className="text-sm truncate"
                          title={transaction.description}
                        >
                          {transaction.description}
                        </p>
                      </div>
                    </TableCell>

                    {/* Trạng thái */}
                    <TableCell>
                      <TransactionStatusBadge
                        status={transaction.status}
                        expiredAt={transaction.expiredAt}
                      />
                    </TableCell>

                    {/* Cổng thanh toán */}
                    <TableCell>
                      {getPaymentGatewayBadge(transaction.paymentGateway)}
                    </TableCell>

                    {/* Thao tác */}
                    <TableCell className="text-center">
                      {canContinuePayment(transaction) && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleContinuePayment(transaction)}
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
