import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  FileSpreadsheet,
  Download,
  MoreVertical,
  Edit,
  Trash2,
  Upload,
  Eye,
  Clock,
  HelpCircle,
  Layers,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  useGetAdminTestsQuery,
  useCreateTestMutation,
  useDeleteTestMutation,
  useImportTestFromExcelMutation,
} from '../services/adminTestApi';
import type { AdminTestListItem } from '../types/admin-test.types';
import axiosInstance from '@/core/api/axios';

const TestCard = ({
  test,
  onEdit,
  onDelete,
  onView,
  onImport,
  onExport,
}: {
  test: AdminTestListItem;
  onEdit: (test: AdminTestListItem) => void;
  onDelete: (test: AdminTestListItem) => void;
  onView: (test: AdminTestListItem) => void;
  onImport: (test: AdminTestListItem) => void;
  onExport: (test: AdminTestListItem) => void;
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1">
      {/* Decorative gradient border */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[2px] bg-gradient-to-br from-white to-slate-50 rounded-lg" />

      <div className="relative">
        {/* Header with gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <CardHeader className="pb-3 pt-5">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-bold text-slate-800 truncate pr-8 mb-2">
                {test.testTitle}
              </CardTitle>
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 border-0 font-medium"
              >
                <FileText className="w-3 h-3 mr-1" />
                {test.type === 'listening-reading'
                  ? 'Listening & Reading'
                  : test.type}
              </Badge>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 hover:bg-slate-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => onView(test)}
                  className="cursor-pointer"
                >
                  <Eye className="h-4 w-4 mr-2 text-blue-500" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onEdit(test)}
                  className="cursor-pointer"
                >
                  <Edit className="h-4 w-4 mr-2 text-amber-500" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onImport(test)}
                  className="cursor-pointer"
                >
                  <Upload className="h-4 w-4 mr-2 text-green-500" />
                  Import Excel
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onExport(test)}
                  className="cursor-pointer"
                >
                  <Download className="h-4 w-4 mr-2 text-purple-500" />
                  Export Excel
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(test)}
                  className="text-red-600 focus:text-red-600 cursor-pointer"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Test
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-5">
          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="flex flex-col items-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <Clock className="h-5 w-5 text-blue-600 mb-1" />
              <span className="text-lg font-bold text-blue-700">
                {test.duration}
              </span>
              <span className="text-xs text-blue-600">min</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <HelpCircle className="h-5 w-5 text-purple-600 mb-1" />
              <span className="text-lg font-bold text-purple-700">
                {test.number_of_questions}
              </span>
              <span className="text-xs text-purple-600">questions</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-gradient-to-br from-pink-50 to-pink-100 rounded-xl">
              <Layers className="h-5 w-5 text-pink-600 mb-1" />
              <span className="text-lg font-bold text-pink-700">
                {test.number_of_parts}
              </span>
              <span className="text-xs text-pink-600">parts</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created: {formatDate(test.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <span>Updated: {formatDate(test.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

export const AdminTestList = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<AdminTestListItem | null>(
    null
  );
  const [newTestTitle, setNewTestTitle] = useState('');
  const [newTestDuration, setNewTestDuration] = useState(120);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Debounce search
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const { data, isLoading, refetch } = useGetAdminTestsQuery({
    page,
    limit: 9,
    search: debouncedSearch,
  });

  const [createTest, { isLoading: isCreating }] = useCreateTestMutation();
  const [deleteTest, { isLoading: isDeleting }] = useDeleteTestMutation();
  const [importFromExcel, { isLoading: isImporting }] =
    useImportTestFromExcelMutation();

  const handleCreate = async () => {
    if (!newTestTitle.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter test name',
        variant: 'destructive',
      });
      return;
    }

    try {
      const newTest = await createTest({
        testTitle: newTestTitle,
        duration: newTestDuration,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Test created successfully',
      });

      setIsCreateDialogOpen(false);
      setNewTestTitle('');
      setNewTestDuration(120);

      // Navigate to edit page to add questions
      navigate(`/admin/tests/${newTest._id}/edit`);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create test',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedTest) return;

    try {
      await deleteTest(selectedTest._id).unwrap();

      toast({
        title: 'Success',
        description: 'Test deleted successfully',
      });

      setIsDeleteDialogOpen(false);
      setSelectedTest(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete test',
        variant: 'destructive',
      });
    }
  };

  const handleImport = async () => {
    if (!selectedTest || !importFile) return;

    try {
      await importFromExcel({
        id: selectedTest._id,
        file: importFile,
      }).unwrap();

      toast({
        title: 'Success',
        description: 'Questions imported successfully',
      });

      setIsImportDialogOpen(false);
      setSelectedTest(null);
      setImportFile(null);
      refetch();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to import Excel file',
        variant: 'destructive',
      });
    }
  };

  const handleExport = async (test: AdminTestListItem) => {
    try {
      const response = await axiosInstance.get(
        `/admin/tests/${test._id}/export`,
        {
          responseType: 'blob',
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${test.testTitle}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Excel file downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export Excel file',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await axiosInstance.get('/admin/tests/template', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'toeic_template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Template downloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to download template',
        variant: 'destructive',
      });
    }
  };

  const tests = data?.tests || [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/30">
                <FileSpreadsheet className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  TOEIC Test Management
                </h1>
                <p className="text-slate-500 mt-1">
                  Create, edit and manage Listening & Reading tests
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={handleDownloadTemplate}
                className="border-2 hover:bg-slate-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </Button>
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg shadow-blue-500/30"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Test
              </Button>
            </div>
          </div>
        </div>

        {/* Search & Stats */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <Input
                placeholder="Search tests..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-12 h-12 bg-white border-2 border-slate-200 focus:border-blue-400 rounded-xl shadow-sm"
              />
            </div>

            {pagination && (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Badge variant="secondary" className="px-3 py-1 bg-white">
                  Total: {pagination.total} tests
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Tests Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-64 animate-pulse bg-slate-100" />
            ))}
          </div>
        ) : tests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="p-6 bg-slate-100 rounded-full mb-6">
              <FileSpreadsheet className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              No tests yet
            </h3>
            <p className="text-slate-500 mb-6 text-center max-w-md">
              Start by creating a new test or import from an Excel file
            </p>
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Test
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((test) => (
              <TestCard
                key={test._id}
                test={test}
                onEdit={(t) => {
                  navigate(`/admin/tests/${t._id}/edit`);
                }}
                onDelete={(t) => {
                  setSelectedTest(t);
                  setIsDeleteDialogOpen(true);
                }}
                onView={(t) => {
                  navigate(`/admin/tests/${t._id}`);
                }}
                onImport={(t) => {
                  setSelectedTest(t);
                  setIsImportDialogOpen(true);
                }}
                onExport={handleExport}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-10 w-10"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - page) <= 2
                )
                .map((p, idx, arr) => (
                  <div key={p} className="flex items-center">
                    {idx > 0 && arr[idx - 1] !== p - 1 && (
                      <span className="px-2 text-slate-400">...</span>
                    )}
                    <Button
                      variant={page === p ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setPage(p)}
                      className={`h-10 w-10 ${
                        page === p
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600'
                          : ''
                      }`}
                    >
                      {p}
                    </Button>
                  </div>
                ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="h-10 w-10"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Create Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <Plus className="h-5 w-5 text-white" />
                </div>
                Create New Test
              </DialogTitle>
              <DialogDescription>
                Enter basic information for your new TOEIC test
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="testTitle">Test Name *</Label>
                <Input
                  id="testTitle"
                  placeholder="E.g.: TOEIC Practice Test 2024 #1"
                  value={newTestTitle}
                  onChange={(e) => setNewTestTitle(e.target.value)}
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={30}
                  max={180}
                  value={newTestDuration}
                  onChange={(e) =>
                    setNewTestDuration(parseInt(e.target.value) || 120)
                  }
                  className="h-11"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="bg-gradient-to-r from-blue-500 to-purple-600"
              >
                {isCreating ? 'Creating...' : 'Create Test'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                Confirm Delete
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete test "{selectedTest?.testTitle}
                "? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Import Dialog */}
        <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                  <Upload className="h-5 w-5 text-white" />
                </div>
                Import Questions from Excel
              </DialogTitle>
              <DialogDescription>
                Upload an Excel file containing questions for test "
                {selectedTest?.testTitle}"
              </DialogDescription>
            </DialogHeader>

            <div className="py-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="excel-upload"
                />
                <label htmlFor="excel-upload" className="cursor-pointer">
                  {importFile ? (
                    <div className="flex flex-col items-center">
                      <FileSpreadsheet className="h-12 w-12 text-green-500 mb-3" />
                      <p className="font-medium text-slate-700">
                        {importFile.name}
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        {(importFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="h-12 w-12 text-slate-400 mb-3" />
                      <p className="font-medium text-slate-700">
                        Drag and drop file or click to select
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Chỉ chấp nhận file .xlsx hoặc .xls
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Note:</strong> Excel file must follow the template
                  format.
                  <button
                    onClick={handleDownloadTemplate}
                    className="underline ml-1 hover:text-blue-900"
                  >
                    Download template here
                  </button>
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsImportDialogOpen(false);
                  setImportFile(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile || isImporting}
                className="bg-gradient-to-r from-green-500 to-emerald-600"
              >
                {isImporting ? 'Importing...' : 'Import'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminTestList;
