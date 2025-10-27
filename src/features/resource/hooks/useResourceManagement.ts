import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  setSearchQuery,
  setActiveTab,
  setCurrentPage,
  setSuitableFilter,
} from '../slices/resourceSlice';
import { useSearchResourcesQuery } from '../services/resourceApi';
import { ResourceType, type Resource } from '../types/resource.type';
import type { RootState } from '@/core/store/store';

interface UseResourceManagementOptions {
  isAdmin?: boolean;
  itemsPerPage?: number;
}

/**
 * Custom hook để quản lý logic chung của resource (search, filter, pagination)
 * Dùng chung cho cả user và admin pages
 */
export const useResourceManagement = (
  options: UseResourceManagementOptions = {}
) => {
  const { isAdmin = false, itemsPerPage = 6 } = options;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { searchQuery, activeTab, currentPage, suitableFilter } = useSelector(
    (state: RootState) => state.resource
  );

  // API call
  const {
    data: resourcesResponse,
    isLoading,
    error,
    refetch,
  } = useSearchResourcesQuery({
    page: currentPage,
    limit: itemsPerPage,
    type: activeTab === 'all' ? undefined : activeTab,
    q: searchQuery.trim() || undefined,
    // Convert suitableFilter ('all' | 'true' | 'false') into boolean | undefined
    suitableForLearners: isAdmin
      ? suitableFilter === 'all'
        ? undefined
        : suitableFilter === 'true'
      : true,
  });

  const resources = resourcesResponse?.data?.resources || [];
  const totalPages = resourcesResponse?.data?.pagination?.totalPages || 1;
  const totalCounts = resourcesResponse?.data?.counts;

  // Handlers
  const handleResourceSelect = (resource: Resource) => {
    // Navigate with resource in state for faster loading (optional optimization)
    // But detail page can also load by ID if state is missing
    navigate(`/resources/${resource._id}`, { state: { resource } });
    window.scrollTo(0, 0);
  };

  const handleSearchChange = (value: string) => {
    dispatch(setSearchQuery(value));
  };

  const handleTabChange = (tab: 'all' | ResourceType) => {
    dispatch(setActiveTab(tab));
  };

  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };

  const handleSuitableFilterChange = (filter: 'all' | 'true' | 'false') => {
    dispatch(setSuitableFilter(filter));
  };

  return {
    // State
    searchQuery,
    activeTab,
    currentPage,
    suitableFilter,
    resources,
    totalPages,
    totalCounts,

    // Loading states
    isLoading,
    error,

    // Handlers
    handleResourceSelect,
    handleSearchChange,
    handleTabChange,
    handlePageChange,
    handleSuitableFilterChange,

    // Utils
    refetch,
  };
};
