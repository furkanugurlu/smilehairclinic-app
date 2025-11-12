import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Text from './Text';

export interface FilterOption {
  id: string;
  label: string;
  icon: string;
  color: string;
  count?: number;
}

interface FilterTabsProps {
  options: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filterId: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
  options,
  selectedFilter,
  onFilterChange,
}) => {
  return (
    <View style={styles.filterWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
      >
        {options.map((option) => {
          const isActive = selectedFilter === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              style={[styles.filterTab, isActive && styles.filterTabActive]}
              onPress={() => onFilterChange(option.id)}
              activeOpacity={0.7}
            >
              <View style={styles.filterContent}>
                <Icon
                  name={option.icon}
                  size={16}
                  color={isActive ? '#FFFFFF' : option.color}
                />
                <Text
                  weight="semibold"
                  style={[styles.filterText, isActive && styles.filterTextActive]}
                >
                  {option.label}
                </Text>
                {option.count !== undefined && (
                  <View
                    style={[
                      styles.filterBadge,
                      isActive && styles.filterBadgeActive,
                    ]}
                  >
                    <Text
                      weight="bold"
                      style={[
                        styles.filterBadgeText,
                        isActive && styles.filterBadgeTextActive,
                      ]}
                    >
                      {option.count}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  filterWrapper: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabActive: {
    backgroundColor: '#01213D',
    borderColor: '#01213D',
    shadowColor: '#01213D',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    color: '#374151',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterBadge: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  filterBadgeText: {
    fontSize: 12,
    color: '#374151',
  },
  filterBadgeTextActive: {
    color: '#FFFFFF',
  },
});

