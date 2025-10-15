import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Pressable, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  Alert
} from 'react-native';
import BackArrow from '@/components/CostThreeButtons/BackArrow';
import { API_BASE } from '../constants/index';

type Category = 'power' | 'time';
type PowerSubCategory = 'electricity' | 'gas' | 'solar';
type TimeSubCategory = 'daily' | 'weekly' | 'monthly';

interface ReportData {
  _id?: string;
  type?: string;
  totalCost: number;
  date?: string;
  deviceId?: {
    device_name?: string;
  };
  dailyKWh?: number;
  monthlyKWh?: number;
}

const getBackendUrl = () => `${API_BASE}/costs/energy-cost`;
const BACKEND_URL = getBackendUrl();

const CostSheetApp = () => {
  const [selectedCategory, setSelectedCategory] = useState<Category>('power');
  const [selectedPowerSub, setSelectedPowerSub] = useState<PowerSubCategory>('electricity');
  const [selectedTimeSub, setSelectedTimeSub] = useState<TimeSubCategory>('daily');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [userId] = useState('USR001'); // Replace with actual user ID

  useEffect(() => {
    if (selectedCategory === 'power') {
      fetchPowerReport();
    } else {
      fetchTimeReport();
    }
  }, [selectedCategory, selectedPowerSub, selectedTimeSub]);

  const fetchPowerReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}?userId=${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        const filtered = data.data.filter((item: any) => item.type === selectedPowerSub);
        const total = filtered.reduce((sum: number, item: any) => sum + item.totalCost, 0);
        setReportData(filtered);
        setTotalCost(total);
      } else {
        throw new Error(data.message || 'Failed to fetch power report');
      }
    } catch (error) {
      console.error('Error fetching power report:', error);
      Alert.alert('Error', 'Failed to fetch power report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeReport = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}?userId=${userId}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      if (data.success) {
        const allData: ReportData[] = data.data;

        const today = new Date();

        const filtered = allData.filter(item => {
          const itemDate = new Date(item.date);
          if (selectedTimeSub === 'daily') {
            return itemDate.toDateString() === today.toDateString();
          } else if (selectedTimeSub === 'weekly') {
            const getWeek = (d: Date) => {
              const oneJan = new Date(d.getFullYear(),0,1);
              return Math.ceil((((d.getTime() - oneJan.getTime()) / 86400000) + oneJan.getDay()+1)/7);
            };
            return getWeek(itemDate) === getWeek(today);
          } else if (selectedTimeSub === 'monthly') {
            return itemDate.getMonth() === today.getMonth() && itemDate.getFullYear() === today.getFullYear();
          }
          return false;
        });

        const total = filtered.reduce((sum, item) => sum + item.totalCost, 0);
        setReportData(filtered);
        setTotalCost(total);
      } else {
        throw new Error(data.message || 'Failed to fetch time report');
      }
    } catch (error) {
      console.error('Error fetching time report:', error);
      Alert.alert('Error', 'Failed to fetch time report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderTopNavigation = () => {
    if (selectedCategory === 'power') {
      return (
        <View style={styles.topNavContainer}>
          <View style={styles.topNav}>
            {['electricity', 'gas', 'solar'].map((type, index) => (
              <Pressable
                key={type}
                style={[
                  styles.topNavButton,
                  index === 0 && styles.topNavLeftButton,
                  index === 1 && styles.topNavMiddleButton,
                  index === 2 && styles.topNavRightButton,
                  selectedPowerSub === type && styles.topNavSelectedButton
                ]}
                onPress={() => setSelectedPowerSub(type as PowerSubCategory)}
              >
                <Text style={[
                  styles.topNavText,
                  selectedPowerSub === type && styles.topNavSelectedText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    } else {
      return (
        <View style={styles.topNavContainer}>
          <View style={styles.topNav}>
            {['daily', 'weekly', 'monthly'].map((type, index) => (
              <Pressable
                key={type}
                style={[
                  styles.topNavButton,
                  index === 0 && styles.topNavLeftButton,
                  index === 1 && styles.topNavMiddleButton,
                  index === 2 && styles.topNavRightButton,
                  selectedTimeSub === type && styles.topNavSelectedButton
                ]}
                onPress={() => setSelectedTimeSub(type as TimeSubCategory)}
              >
                <Text style={[
                  styles.topNavText,
                  selectedTimeSub === type && styles.topNavSelectedText
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      );
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#16a34a" />
          <Text style={styles.loadingText}>Loading data...</Text>
        </View>
      );
    }

    const title = selectedCategory === 'power' 
      ? `${selectedPowerSub.charAt(0).toUpperCase() + selectedPowerSub.slice(1)} Costs`
      : `${selectedTimeSub.charAt(0).toUpperCase() + selectedTimeSub.slice(1)} Report`;

    return (
      <View style={styles.contentArea}>
        <Text style={styles.contentTitle}>{title}</Text>
        <Text style={styles.contentSubtitle}>
          {selectedCategory === 'power' 
            ? `View and manage your ${selectedPowerSub} expenses`
            : `${selectedTimeSub.charAt(0).toUpperCase() + selectedTimeSub.slice(1)} expense breakdown`
          }
        </Text>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Cost</Text>
          <Text style={styles.totalAmount}>LKR {totalCost.toFixed(2)}</Text>
          <Text style={styles.totalCount}>{reportData.length} entries</Text>
        </View>

        {reportData.length > 0 ? (
          <View style={styles.dataList}>
            {reportData.map((item: any, index) => (
              <View key={index} style={styles.dataCard}>
                <View style={styles.dataHeader}>
                  <View style={styles.dataIconContainer}>
                    <Text style={styles.dataIcon}>
                      {item.type === 'electricity' ? '⚡' : item.type === 'gas' ? '⛽' : '☀'}
                    </Text>
                  </View>
                  <View style={styles.dataInfo}>
                    <Text style={styles.dataTitle}>
                      {item.deviceId?.device_name || item.type}
                    </Text>
                    <Text style={styles.dataSubtitle}>
                      {selectedCategory === 'power'
                        ? new Date(item.date).toLocaleDateString()
                        : selectedTimeSub + ' total'}
                    </Text>
                  </View>
                  <Text style={styles.dataCost}>LKR {item.totalCost.toFixed(2)}</Text>
                </View>
                {item.monthlyKWh && (
                  <View style={styles.dataStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Daily kWh</Text>
                      <Text style={styles.statValue}>{item.dailyKWh?.toFixed(2) || 'N/A'}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>Monthly kWh</Text>
                      <Text style={styles.statValue}>{item.monthlyKWh?.toFixed(2) || 'N/A'}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubtext}>
              Start adding energy costs to see reports here
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <BackArrow style={styles.backArrow}/>
          <Text style={styles.headerTitle}>💡 Cost Reports</Text>
        </View>
        <Text style={styles.headerSubtitle}>Track your energy expenses</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.categorySelector}>
          <Text style={styles.selectorLabel}>Select Category</Text>
          <View style={styles.categoryButtons}>
            <Pressable
              style={[
                styles.categoryButton,
                styles.categoryLeftButton,
                selectedCategory === 'power' && styles.categorySelectedButton
              ]}
              onPress={() => setSelectedCategory('power')}
            >
              <Text style={styles.categoryEmoji}>⚡</Text>
              <Text style={[styles.categoryButtonText, selectedCategory === 'power' && styles.categorySelectedText]}>
                Power
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.categoryButton,
                styles.categoryRightButton,
                selectedCategory === 'time' && styles.categorySelectedButton
              ]}
              onPress={() => setSelectedCategory('time')}
            >
              <Text style={styles.categoryEmoji}>🕐</Text>
              <Text style={[styles.categoryButtonText, selectedCategory === 'time' && styles.categorySelectedText]}>
                Time
              </Text>
            </Pressable>
          </View>
        </View>

        {renderTopNavigation()}
        {renderContent()}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F9F4',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
  },
    headerRow: {
    flexDirection: 'row', // 👈 makes BackArrow + Title in one line
    alignItems: 'center', // vertically align them in middle
    gap: 8, // spacing between arrow and text (React Native 0.71+)
  },
 backArrow: {
  position: 'absolute',
  right : 230,
  top: 16,
},
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#16a34a',
    textAlign: 'center',
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 6,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  categorySelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  selectorLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  categoryButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  categoryLeftButton: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  categoryRightButton: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  categorySelectedButton: {
    backgroundColor: '#16a34a',
    borderColor: '#16a34a',
  },
  categoryEmoji: {
    fontSize: 20,
  },
  categoryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
  },
  categorySelectedText: {
    color: '#FFFFFF',
  },
  topNavContainer: {
    marginBottom: 16,
  },
  topNav: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  topNavButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 3,
  },
  topNavLeftButton: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  topNavMiddleButton: {},
  topNavRightButton: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  topNavSelectedButton: {
    backgroundColor: '#16a34a',
    borderRadius: 8,
  },
  topNavText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  topNavSelectedText: {
    color: '#FFFFFF',
  },
  contentArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  contentTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  contentSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  totalCard: {
    backgroundColor: '#F0F9F4',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#16a34a',
  },
  totalLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginBottom: 8,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: '#16a34a',
    marginBottom: 4,
  },
  totalCount: {
    fontSize: 12,
    color: '#6B7280',
  },
  dataList: {
    gap: 12,
  },
  dataCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dataIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9F4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dataIcon: {
    fontSize: 20,
  },
  dataInfo: {
    flex: 1,
  },
  dataTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  dataSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  dataCost: {
    fontSize: 16,
    fontWeight: '700',
    color: '#16a34a',
  },
  dataStats: {
    flexDirection: 'row',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 20,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 10,
    color: '#9CA3AF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '600',
    marginTop: 4,
  },
  loadingContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 60,
    alignItems: 'center',
    shadowColor: '#16a34a',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingText: {
    marginTop: 16,
    color: '#6B7280',
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

export default CostSheetApp;