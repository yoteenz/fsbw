
import { useState, useRef, useEffect } from 'react';

interface RecentActivityProps {
  onViewModeChange?: (viewMode: string) => void;
}

export default function RecentActivity({ onViewModeChange }: RecentActivityProps) {
  const [viewMode, setViewMode] = useState('list');
  const [archivedNotifications, setArchivedNotifications] = useState<number[]>([]);
  const [expandedCards, setExpandedCards] = useState<number[]>([]);
  const [groupOrder, setGroupOrder] = useState(['ALERTS', 'SALES', 'BOOKINGS', 'ORDERS', 'CLIENTS', 'REMINDERS', 'OPERATIONAL', 'SYSTEM', 'BRAND']);
  // Auto-expand all groups in grid view by default
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['ALERTS', 'SALES', 'BOOKINGS', 'ORDERS', 'CLIENTS', 'REMINDERS', 'OPERATIONAL', 'SYSTEM', 'BRAND']);
  const [isDragging, setIsDragging] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedElement, setDraggedElement] = useState<HTMLElement | null>(null);

  // List view notifications (only alerts, sales, bookings, orders, clients, reminders)
  const listViewNotifications = [
    {
      id: 1,
      type: 'order_authorization',
      orderNumber: '#17',
      title: 'ORDER #17 NEEDS ORDER FORM (24 HOURS)',
      timeRemaining: '24 HOURS REMAINING',
      category: 'ALERTS',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'urgent',
      viewed: false,
      customer: {
        name: 'LISA SCOTT',
        location: 'ARLINGTON, VA TN USA',
        tier: 'BASIC SILVER TIER',
        paymentMethod: 'VISA MASTERCARD',
      },
      product: {
        name: 'SOFT WAVE',
        specs: '30\" 13X6 200% DENSITY',
        size: 'CAP SIZE: M',
        color: 'JET BLACK',
        gift: 'FREE GIFT: HAIR BRUSH',
      },
      orderDate: '2/6',
      action: 'CLICK HERE TO RESEND FORM',
    },
    {
      id: 2,
      type: 'low_inventory',
      title: 'LOW INVENTORY - RESTOCK (5) ITEMS',
      category: 'ALERTS',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'urgent',
      viewed: false,
      customer: {
        name: 'INVENTORY MANAGER',
        location: 'WAREHOUSE',
        tier: 'SYSTEM',
      },
      items: [
        { name: 'NOIR', stock: '5/25' },
        { name: 'SOFT WAVE', stock: '8/25' },
        { name: 'SATIN BONNET', stock: '50/250' },
      ],
      action: 'REORDER INVENTORY',
    },
    {
      id: 4,
      type: 'appointment_conflict',
      title: 'APPOINTMENT CONFLICT - DOUBLE BOOKING DETECTED',
      category: 'BOOKINGS',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'urgent',
      viewed: false,
      customer: {
        name: 'SARAH WILSON & MARK DAVIS',
        location: 'MIAMI, FL USA',
        tier: 'PREMIUM TIER',
        conflictTime: '2:00 PM TODAY',
      },
      action: 'RESOLVE BEFORE APPOINTMENT',
    },
    {
      id: 5,
      type: 'client_complaint',
      title: 'CLIENT COMPLAINT - PRIORITY RESPONSE NEEDED',
      category: 'CLIENTS',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'urgent',
      viewed: false,
      customer: {
        name: 'ABC CORPORATION',
        location: 'NEW YORK, NY USA',
        tier: 'ENTERPRISE',
        issue: 'PRODUCT QUALITY CONCERNS',
      },
      action: 'RESPONSE DUE IN 2 HOURS',
    }
  ];

  // Operational notifications (only show in grid view)
  const operationalNotifications = [
    {
      id: 6,
      type: 'shipping_delay',
      title: 'SHIPPING DELAY - 12 ORDERS AFFECTED',
      category: 'OPERATIONAL',
      date: '2/5',
      dateSort: new Date(2025, 1, 5),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'MULTIPLE CUSTOMERS',
        location: 'VARIOUS LOCATIONS',
        tier: 'VARIOUS',
      },
      action: 'UPDATE CUSTOMERS BY EOD',
    },
    {
      id: 7,
      type: 'refund_request',
      title: 'REFUND REQUEST - CUSTOMER ID #789',
      category: 'OPERATIONAL',
      date: '2/5',
      dateSort: new Date(2025, 1, 5),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'EMILY RODRIGUEZ',
        location: 'AUSTIN, TX USA',
        tier: 'STANDARD',
        reason: 'PRODUCT RETURN WITHIN WARRANTY',
      },
      action: 'PROCESS WITHIN 3 DAYS',
    },
    {
      id: 8,
      type: 'equipment_failure',
      title: 'EQUIPMENT FAILURE - PRINTER OFFLINE',
      category: 'OPERATIONAL',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'low',
      viewed: false,
      customer: {
        name: 'OFFICE MANAGER',
        location: 'MAIN OFFICE',
        tier: 'INTERNAL',
      },
      action: 'SCHEDULE REPAIR',
    }
  ];

  // System notifications (only show in grid view under "SYSTEM" group)
  const systemNotifications = [
    {
      id: 20,
      type: 'system_maintenance',
      title: 'SYSTEM MAINTENANCE - SECURITY UPDATE REQUIRED',
      category: 'SYSTEM',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'SYSTEM ADMINISTRATOR',
        location: 'SERVER ROOM',
        tier: 'ADMIN',
      },
      action: 'SCHEDULE WITHIN 24 HOURS',
    },
    {
      id: 21,
      type: 'server_error',
      title: 'SERVER ERROR - DATABASE CONNECTION LOST',
      category: 'SYSTEM',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'TECHNICAL TEAM',
        location: 'IT DEPARTMENT',
        tier: 'INTERNAL',
      },
      action: 'RESTORE CONNECTION',
    },
    {
      id: 22,
      type: 'security_alert',
      title: 'SECURITY ALERT - UNUSUAL LOGIN ACTIVITY',
      category: 'SYSTEM',
      date: '2/5',
      dateSort: new Date(2025, 1, 5),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'SECURITY TEAM',
        location: 'MONITORING CENTER',
        tier: 'SECURITY',
      },
      action: 'MONITOR AND INVESTIGATE',
    },
    {
      id: 23,
      type: 'system_update',
      title: 'SYSTEM UPDATE - NEW FEATURES AVAILABLE',
      category: 'SYSTEM',
      date: '2/5',
      dateSort: new Date(2025, 1, 5),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'DEVELOPMENT TEAM',
        location: 'DEV ENVIRONMENT',
        tier: 'INTERNAL',
      },
      action: 'DEPLOY NEXT WEEKEND',
    },
    {
      id: 24,
      type: 'backup_reminder',
      title: 'BACKUP REMINDER - WEEKLY DATA BACKUP DUE',
      category: 'SYSTEM',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'IT DEPARTMENT',
        location: 'DATA CENTER',
        tier: 'INTERNAL',
      },
      action: 'COMPLETE BY FRIDAY',
    }
  ];

  // Brand notifications (only show in grid view under "BRAND" group)
  const brandNotifications = [
    {
      id: 30,
      type: 'revenue_threshold',
      title: 'REVENUE THRESHOLD - MONTHLY TARGET EXCEEDED',
      category: 'BRAND',
      date: '2/6',
      dateSort: new Date(2025, 1, 6),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'FINANCE DEPARTMENT',
        location: 'CORPORATE',
        tier: 'MANAGEMENT',
      },
      action: 'CELEBRATE SUCCESS!',
    },
    {
      id: 31,
      type: 'client_retention',
      title: 'CLIENT RETENTION - 94% ACHIEVEMENT UNLOCKED',
      category: 'BRAND',
      date: '2/5',
      dateSort: new Date(2025, 1, 5),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'ACCOUNT MANAGEMENT',
        location: 'CLIENT SERVICES',
        tier: 'MANAGEMENT',
      },
      action: 'SHARE MILESTONE WITH TEAM',
    },
    {
      id: 32,
      type: 'growth_milestone',
      title: 'GROWTH MILESTONE - 15% INCREASE THIS QUARTER',
      category: 'BRAND',
      date: '2/5',
      dateSort: new Date(2025, 1, 5),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'BUSINESS DEVELOPMENT',
        location: 'STRATEGY OFFICE',
        tier: 'EXECUTIVE',
      },
      action: 'PLAN EXPANSION STRATEGY',
    },
    {
      id: 33,
      type: 'performance_metrics',
      title: 'PERFORMANCE METRICS - TARGETS EXCEEDED',
      category: 'BRAND',
      date: '2/4',
      dateSort: new Date(2025, 1, 4),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'MANAGEMENT TEAM',
        location: 'EXECUTIVE SUITE',
        tier: 'EXECUTIVE',
      },
      action: 'REVIEW AND SET NEW GOALS',
    },
    {
      id: 34,
      type: 'brand_recognition',
      title: 'BRAND RECOGNITION - NEW MARKET PENETRATION',
      category: 'BRAND',
      date: '2/4',
      dateSort: new Date(2025, 1, 4),
      urgency: 'medium',
      viewed: false,
      customer: {
        name: 'MARKETING DIRECTOR',
        location: 'MARKETING DEPT',
        tier: 'MANAGEMENT',
      },
      action: 'DEVELOP TARGETED CAMPAIGNS',
    }
  ];

  // Enhanced grouping for grid view
  const groupedNotifications = [
    {
      category: 'ALERTS',
      items: [
        'LOW INVENTORY - RESTOCK (5) ITEMS',
        'ORDER #17 NEEDS AUTHORIZATION FORM (24 HOURS)',
        'QUALITY ISSUE - BATCH #4456 DEFECTIVE',
        'DELIVERY FAILURE - ADDRESS VERIFICATION NEEDED',
        'COMPLIANCE WARNING - REGULATION CHANGES',
        'TEMPERATURE ALERT - COLD STORAGE MALFUNCTION',
        'DATA BREACH - SECURITY INCIDENT REPORTED',
        'SUBSCRIPTION RENEWAL - AUTO-PAYMENT FAILED',
        'CUSTOMER ESCALATION - MANAGER INTERVENTION REQUIRED'
      ],
      urgency: 'urgent',
      icon: <i className="ri-alert-line text-lg" style={{ color: '#EB1C24' }}></i>,
    },
    {
      category: 'SALES',
      items: [
        'CONSULTATION BOOKED - MARIA R.',
        'PAYMENT RECEIVED - $850',
        'NEW PURCHASE ORDER - DECEMBER 19TH',
        'REVENUE TARGET - MONTHLY GOAL ACHIEVED',
        'SALES MILESTONE - Q4 PERFORMANCE STRONG',
        'CUSTOMER INQUIRY - PRODUCT CONSULTATION',
        'QUOTE REQUEST - ENTERPRISE CLIENT',
        'CONTRACT SIGNED - NEW PARTNERSHIP'
      ],
      urgency: 'medium',
      icon: <i className="ri-money-dollar-circle-line text-lg" style={{ color: '#FF8C00' }}></i>,
    },
    {
      category: 'BOOKINGS',
      items: [
        'APPOINTMENT CONFLICT - DOUBLE BOOKING DETECTED',
        'FOLLOW-UP SCHEDULED - LISA W.',
        'APPOINTMENT REMINDER - 2 HOURS NOTICE',
        'BOOKING CONFIRMATION - SARAH M.',
        'SCHEDULE CHANGE - CLIENT REQUEST',
        'CANCELLATION NOTICE - REFUND PROCESSED',
        'GROUP BOOKING - CORPORATE EVENT',
        'WAITLIST UPDATE - SLOT AVAILABLE',
        'BOOKING CONFLICT - RESOLUTION NEEDED'
      ],
      urgency: 'medium',
      icon: <i className="ri-calendar-line text-lg" style={{ color: '#FF8C00' }}></i>,
    },
    {
      category: 'ORDERS',
      items: [
        'RUSH ORDER - ORDER #17',
        'ORDER SHIPPED - #ORD-2024-089',
        'ORDER DELAY - SUPPLIER ISSUE',
        'BULK ORDER - PROCESSING REQUIRED',
        'ORDER MODIFICATION - CLIENT REQUEST',
        'SHIPPING UPDATE - TRACKING AVAILABLE',
        'ORDER COMPLETION - READY FOR PICKUP',
        'RETURN REQUEST - ORDER #156'
      ],
      urgency: 'medium',
      icon: <i className="ri-shopping-bag-line text-lg" style={{ color: '#FF8C00' }}></i>,
    },
    {
      category: 'CLIENTS',
      items: [
        'CLIENT COMPLAINT - PRIORITY RESPONSE NEEDED',
        'NEW REFERRAL - ASHLEY K.',
        'CLIENT PROFILE UPDATED - JENNIFER D.',
        'CLIENT TIER UPGRADE - PREMIUM STATUS',
        'CLIENT FEEDBACK - 5-STAR REVIEW',
        'CLIENT MILESTONE - ANNIVERSARY DATE',
        'CLIENT CONTACT - INFORMATION UPDATE',
        'CLIENT RETENTION - LOYALTY PROGRAM',
        'CLIENT INQUIRY - SERVICE QUESTION'
      ],
      urgency: 'medium',
      icon: <i className="ri-user-line text-lg" style={{ color: '#FF8C00' }}></i>,
    },
    {
      category: 'REMINDERS',
      items: [
        'FOLLOW-UP DUE - CLIENT CHECK-IN',
        'MAINTENANCE REMINDER - EQUIPMENT SERVICE',
        'RENEWAL NOTICE - LICENSE EXPIRY',
        'PAYMENT REMINDER - INVOICE DUE',
        'BACKUP REMINDER - DATA SECURITY',
        'MEETING REMINDER - STAFF BRIEFING',
        'INVENTORY CHECK - MONTHLY AUDIT',
        'REVIEW REMINDER - CLIENT FEEDBACK'
      ],
      urgency: 'low',
      icon: <i className="ri-notification-line text-lg" style={{ color: '#909090' }}></i>,
    },
    {
      category: 'OPERATIONAL',
      items: [
        'SHIPPING DELAY - 12 ORDERS AFFECTED',
        'REFUND REQUEST - CUSTOMER ID #789',
        'EQUIPMENT FAILURE - PRINTER OFFLINE',
        'BUDGET ALERT - DEPARTMENT SPENDING LIMIT REACHED',
        'EMPLOYEE ABSENCE - SHIFT COVERAGE REQUIRED',
        'NETWORK ISSUE - SLOW CONNECTION DETECTED',
        'INVENTORY AUDIT - DISCREPANCY FOUND',
        'FIRE SAFETY - ALARM SYSTEM TEST DUE',
        'MAINTENANCE SCHEDULE - EQUIPMENT SERVICE DUE',
        'LICENSE EXPIRY - SOFTWARE LICENSE ENDING'
      ],
      urgency: 'medium',
      icon: <i className="ri-settings-2-line text-lg" style={{ color: '#FF8C00' }}></i>,
    },
    {
      category: 'SYSTEM',
      items: [
        'SYSTEM MAINTENANCE - SECURITY UPDATE REQUIRED',
        'SERVER ERROR - DATABASE CONNECTION LOST',
        'SECURITY ALERT - UNUSUAL LOGIN ACTIVITY',
        'SYSTEM UPDATE - NEW FEATURES AVAILABLE',
        'BACKUP REMINDER - WEEKLY DATA BACKUP DUE'
      ],
      urgency: 'medium',
      icon: <i className="ri-settings-line text-lg" style={{ color: '#FF8C00' }}></i>,
    },
    {
      category: 'BRAND',
      items: [
        'REVENUE THRESHOLD - MONTHLY TARGET EXCEEDED',
        'CLIENT RETENTION - 94% ACHIEVEMENT UNLOCKED',
        'GROWTH MILESTONE - 15% INCREASE THIS QUARTER',
        'PERFORMANCE METRICS - TARGETS EXCEEDED',
        'BRAND RECOGNITION - NEW MARKET PENETRATION'
      ],
      urgency: 'medium',
      icon: <i className="ri-trophy-line text-lg" style={{ color: '#FF8C00' }}></i>,
    }
  ];

  const groupDates = {
    ALERTS: '2/6',
    SALES: '2/6',
    BOOKINGS: '2/6',
    ORDERS: '2/6',
    CLIENTS: '2/6',
    REMINDERS: '2/6',
    OPERATIONAL: '2/6',
    SYSTEM: '2/6',
    BRAND: '2/6',
  };

  const getUrgencyLineColor = (urgency: string, viewed: boolean) => {
    if (viewed) return '#909090';
    switch (urgency) {
      case 'urgent':
        return '#EB1C24';
      case 'medium':
        return '#ffa500';
      case 'low':
      default:
        return '#909090';
    }
  };

  // For list view, only show the specific list view notifications (no operational, system, or brand)
  const activeNotifications = listViewNotifications
    .filter((n) => !archivedNotifications.includes(n.id))
    .sort((a, b) => b.dateSort.getTime() - a.dateSort.getTime());

  const toggleCardExpansion = (cardId: number) => {
    setExpandedCards((prev) =>
      prev.includes(cardId) ? prev.filter((id) => id !== cardId) : [...prev, cardId],
    );
  };
  const isCardExpanded = (cardId: number) => expandedCards.includes(cardId);

  const toggleGroupExpansion = (groupName: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupName) ? prev.filter((g) => g !== groupName) : [...prev, groupName],
    );
  };
  const isGroupExpanded = (groupName: string) => expandedGroups.includes(groupName);

  const handleGroupDragStart = (
    e: React.TouchEvent | React.MouseEvent,
    groupName: string,
  ) => {
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;

    setIsDragging(groupName);
    setDragOffset({ x: clientX, y: clientY });

    const target = (e.target as HTMLElement).closest('[data-group]') as HTMLElement;
    if (target) {
      setDraggedElement(target);
      target.style.opacity = '0.7';
      target.style.transform = 'scale(0.95)';
      target.style.zIndex = '1000';
    }
  };

  const handleGroupDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const deltaY = clientY - dragOffset.y;

    if (draggedElement) {
      draggedElement.style.transform = `scale(0.95) translateY(${deltaY}px)`;
    }

    const elements = document.elementsFromPoint(clientX, clientY);
    const hoveredGroup = elements.find(
      (el) => el.hasAttribute('data-group') && el.getAttribute('data-group') !== isDragging,
    );

    if (hoveredGroup) {
      const targetGroupName = hoveredGroup.getAttribute('data-group');
      if (targetGroupName && targetGroupName !== isDragging) {
        const curIdx = groupOrder.indexOf(isDragging);
        const tgtIdx = groupOrder.indexOf(targetGroupName);
        if (curIdx !== -1 && tgtIdx !== -1 && curIdx !== tgtIdx) {
          const newOrder = [...groupOrder];
          newOrder.splice(curIdx, 1);
          newOrder.splice(tgtIdx, 0, isDragging);
          setGroupOrder(newOrder);
        }
      }
    }
  };

  const handleGroupDragEnd = () => {
    if (draggedElement) {
      draggedElement.style.opacity = '';
      draggedElement.style.transform = '';
      draggedElement.style.zIndex = '';
    }
    setIsDragging(null);
    setDragOffset({ x: 0, y: 0 });
    setDraggedElement(null);
  };

  useEffect(() => {
    if (!isDragging) return;

    const move = (e: MouseEvent | TouchEvent) => {
      handleGroupDragMove(e as any);
    };
    const end = () => {
      handleGroupDragEnd();
    };

    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', end);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', end);

    return () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', end);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', end);
    };
  }, [isDragging, dragOffset]);

  const getGroupCount = (groupName: string) => {
    const group = groupedNotifications.find((g) => g.category === groupName) || { items: [] };
    return group.items.length;
  };

  const SwipeCard = ({
    notification,
    children,
  }: {
    notification: any;
    children: React.ReactNode;
  }) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [startX, setStartX] = useState(0);
    const [currentX, setCurrentX] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [showArchiveButton, setShowArchiveButton] = useState(false);

    const handleTouchStart = (e: React.TouchEvent) => {
      setStartX(e.touches[0].clientX);
      setDragging(true);
    };
    const handleTouchMove = (e: React.TouchEvent) => {
      if (!dragging) return;
      const cur = e.touches[0].clientX;
      const diff = cur - startX;

      if (showArchiveButton) {
        if (diff > 0) {
          const newX = Math.min(-60 + diff, 0);
          setCurrentX(newX);
          cardRef.current?.style.setProperty('transform', `translateX(${newX}px)`);
        } else {
          setCurrentX(-60);
          cardRef.current?.style.setProperty('transform', `translateX(-60px)`);
        }
      } else {
        if (diff < 0) {
          setCurrentX(diff);
          cardRef.current?.style.setProperty('transform', `translateX(${diff}px)`);
          if (Math.abs(diff) > 40) setShowArchiveButton(true);
        }
      }
    };
    const handleTouchEnd = () => {
      setDragging(false);
      if (showArchiveButton) {
        if (currentX > -30) {
          setShowArchiveButton(false);
          cardRef.current?.style.setProperty('transform', 'translateX(0)');
          setCurrentX(0);
        } else {
          cardRef.current?.style.setProperty('transform', 'translateX(-60px)');
          setCurrentX(-60);
        }
      } else {
        if (currentX < -60) {
          setShowArchiveButton(true);
          cardRef.current?.style.setProperty('transform', 'translateX(-60px)');
          setCurrentX(-60);
        } else {
          cardRef.current?.style.setProperty('transform', 'translateX(0)');
          setCurrentX(0);
        }
      }
    };

    const handleMouseDown = (e: React.MouseEvent) => {
      setStartX(e.clientX);
      setDragging(true);
      e.preventDefault();
    };
    const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragging) return;
      const diff = e.clientX - startX;

      if (showArchiveButton) {
        if (diff > 0) {
          const newX = Math.min(-60 + diff, 0);
          setCurrentX(newX);
          cardRef.current?.style.setProperty('transform', `translateX(${newX}px)`);
        } else {
          setCurrentX(-60);
          cardRef.current?.style.setProperty('transform', `translateX(-60px)`);
        }
      } else {
        if (diff < 0) {
          setCurrentX(diff);
          cardRef.current?.style.setProperty('transform', `translateX(${diff}px)`);
          if (Math.abs(diff) > 40) setShowArchiveButton(true);
        }
      }
    };
    const handleMouseUp = () => {
      if (!dragging) return;
      setDragging(false);
      if (showArchiveButton) {
        if (currentX > -30) {
          setShowArchiveButton(false);
          cardRef.current?.style.setProperty('transform', 'translateX(0)');
          setCurrentX(0);
        } else {
          cardRef.current?.style.setProperty('transform', 'translateX(-60px)');
          setCurrentX(-60);
        }
      } else {
        if (currentX < -60) {
          setShowArchiveButton(true);
          cardRef.current?.style.setProperty('transform', 'translateX(-60px)');
          setCurrentX(-60);
        } else {
          cardRef.current?.style.setProperty('transform', 'translateX(0)');
          setCurrentX(0);
        }
      }
    };

    useEffect(() => {
      const gm = (e: MouseEvent) => {
        if (!dragging) return;
        const diff = e.clientX - startX;
        if (showArchiveButton) {
          if (diff > 0) {
            const newX = Math.min(-60 + diff, 0);
            setCurrentX(newX);
            cardRef.current?.style.setProperty('transform', `translateX(${newX}px)`);
          } else {
            setCurrentX(-60);
            cardRef.current?.style.setProperty('transform', `translateX(-60px)`);
          }
        } else {
          if (diff < 0) {
            setCurrentX(diff);
            cardRef.current?.style.setProperty('transform', `translateX(${diff}px)`);
            if (Math.abs(diff) > 40) setShowArchiveButton(true);
          }
        }
      };
      const gu = () => {
        if (!dragging) return;
        if (showArchiveButton) {
          if (currentX > -30) {
            setShowArchiveButton(false);
            cardRef.current?.style.setProperty('transform', 'translateX(0)');
            setCurrentX(0);
          } else {
            cardRef.current?.style.setProperty('transform', 'translateX(-60px)');
            setCurrentX(-60);
          }
        } else {
          if (currentX < -60) {
            setShowArchiveButton(true);
            cardRef.current?.style.setProperty('transform', 'translateX(-60px)');
            setCurrentX(-60);
          } else {
            cardRef.current?.style.setProperty('transform', 'translateX(0)');
            setCurrentX(0);
          }
        }
        setDragging(false);
      };
      if (dragging) {
        document.addEventListener('mousemove', gm);
        document.addEventListener('mouseup', gu);
      }
      return () => {
        document.removeEventListener('mousemove', gm);
        document.removeEventListener('mouseup', gu);
      };
    }, [dragging, startX, currentX, showArchiveButton]);

    const handleArchiveClick = () => {
      setShowArchiveButton(false);
      try {
        if (cardRef.current) {
          cardRef.current.style.transition = 'transform 0.3s, opacity 0.3s';
          cardRef.current.style.transform = 'translateX(-100%)';
          cardRef.current.style.opacity = '0';
        }
        setTimeout(() => {
          setArchivedNotifications((prev) => [...prev, notification.id]);
        }, 300);
      } catch (err) {
        console.error('Failed to archive notification', err);
      }
    };

    return (
      <div className="relative">
        {showArchiveButton && (
          <div className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center z-10 -ml-1">
            <button
              onClick={handleArchiveClick}
              className="bg-white/60 backdrop-blur-sm border border-black w-full h-full flex items-center justify-center hover:bg-white/80 transition-all duration-300 ease-out shadow-lg hover:shadow-xl hover:-translate-y-1"
              style={{ borderWidth: '1.4px' }}
            >
              <i className="ri-close-line text-red-500 text-base" style={{ color: '#EB1C24' }}></i>
            </button>
          </div>
        )}

        <div
          ref={cardRef}
          className={`bg-white/60 backdrop-blur-sm border border-black overflow-hidden ${dragging ? 'cursor-grabbing' : 'cursor-grab'} transition-all duration-300 ease-out select-none relative z-20 shadow-lg hover:shadow-xl hover:-translate-y-1 ${showArchiveButton ? '-mr-1' : ''}`}
          style={{ borderWidth: '1.4px', userSelect: 'none' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          {children}
        </div>
      </div>
    );
  };

  const handleViewModeChange = (newViewMode: string) => {
    setViewMode(newViewMode);
    // Auto-expand all groups when switching to grid view
    if (newViewMode === 'grouped') {
      setExpandedGroups(['ALERTS', 'SALES', 'BOOKINGS', 'ORDERS', 'CLIENTS', 'REMINDERS', 'OPERATIONAL', 'SYSTEM', 'BRAND']);
    }
    onViewModeChange?.(newViewMode);
  };

  // Helper function to format text with red after hyphen and red parentheses
  const formatTextWithRedAfterHyphen = (text: string) => {
    // Special handling for the order form text
    if (text.includes("ORDER #17 NEEDS ORDER FORM (24 HOURS)")) {
      return (
        <>
          <span className="text-black font-grace" style={{ color: '#EB1C24', opacity: 1 }}>
            ORDER #17 NEEDS ORDER FORM{' '}
          </span>
          <span className="text-red-500 font-grace" style={{ color: '#EB1C24', opacity: 1 }}>
            (24 HOURS)
          </span>
        </>
      );
    }

    const parts = text.split(' - ');
    if (parts.length === 2) {
      return (
        <>
          <span className="text-black font-grace" style={{ opacity: 1 }}>
            {parts[0]} -{' '}
          </span>
          <span className="text-red-500 font-grace" style={{ color: '#EB1C24', opacity: 1 }}>
            {parts[1]}
          </span>
        </>
      );
    }
    return <span className="text-black font-grace" style={{ opacity: 1 }}>{text}</span>;
  };

  return (
    <div>
      {/* View mode icons only - floating top right */}
      <div className="mb-1 flex justify-end">
        <div className="flex items-center flex-shrink-0">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`w-6 h-6 flex items-center justify-center ${viewMode === 'list' ? 'text-red-500' : 'text-black'}`}
            style={{ color: viewMode === 'list' ? '#EB1C24' : '#000000' }}
          >
            <div className="flex flex-col justify-center h-3 space-y-1">
              <div className="w-3 h-px bg-current"></div>
              <div className="w-3 h-px bg-current"></div>
              <div className="w-3 h-px bg-current"></div>
            </div>
          </button>

          <button
            onClick={() => handleViewModeChange(viewMode === 'grouped' ? 'list' : 'grouped')}
            className={`w-6 h-6 flex items-center justify-center ${viewMode === 'grouped' ? 'text-red-500' : 'text-black'}`}
            style={{ color: viewMode === 'grouped' ? '#EB1C24' : '#000000' }}
          >
            <div
              className={`w-3 h-3 border notif-grid-icon relative ${viewMode === 'grouped' ? 'border-red-500 bg-white' : 'border-current bg-white'}`}
              style={{ borderColor: viewMode === 'grouped' ? '#EB1C24' : 'currentColor' }}
            >
              <div
                className={`absolute top-1/2 left-0 right-0 h-px transform -translate-y-1/2 ${viewMode === 'grouped' ? 'bg-red-500' : 'bg-current'}`}
                style={{ backgroundColor: viewMode === 'grouped' ? '#EB1C24' : 'currentColor' }}
              ></div>
              <div
                className={`absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2 ${viewMode === 'grouped' ? 'bg-red-500' : 'bg-current'}`}
                style={{ backgroundColor: viewMode === 'grouped' ? '#EB1C24' : 'currentColor' }}
              ></div>
            </div>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="space-y-3">
        {viewMode === 'grouped' ? (
          // GROUPED VIEW - includes all three groups
          groupOrder.map((groupName) => {
            const count = getGroupCount(groupName);
            if (count === 0) return null;
            const isExpanded = isGroupExpanded(groupName);
            const groupData = groupedNotifications.find((g) => g.category === groupName);
            return (
              <div
                key={groupName}
                data-group={groupName}
                className={`bg-white/60 backdrop-blur-sm border border-black shadow-lg hover:shadow-xl transition-all duration-300 ease-out ${isDragging === groupName ? '' : 'cursor-move'}`}
                style={{ borderWidth: '1.4px', zIndex: isDragging === groupName ? 1000 : 'auto' }}
                onMouseDown={(e) => {
                  const target = e.target as HTMLElement;
                  const isHeaderClick = target.closest('.group-header');
                  if (!isHeaderClick) {
                    handleGroupDragStart(e, groupName);
                  }
                }}
                onTouchStart={(e) => {
                  const target = e.target as HTMLElement;
                  const isHeaderClick = target.closest('.group-header');
                  if (!isHeaderClick) {
                    handleGroupDragStart(e, groupName);
                  }
                }}
              >
                {/* Modified group header (icon removed) */}
                <div
                  className="group-header flex items-center justify-between p-3 cursor-pointer transition-colors duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleGroupExpansion(groupName);
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-black font-bold text-xs font-futura tracking-wider" style={{ opacity: 1, fontSize: '10px', fontWeight: '500' }}>
                      {groupName}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-red-500 font-bold text-sm font-covered-by-your-grace tracking-wider" style={{ color: '#EB1C24', opacity: 1, fontWeight: 'normal' }}>
                      ({count})
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-3 pb-3 space-y-1 border-t border-gray-200 pt-2">
                    {groupData?.items.map((subItem, subIdx) => {
                      return (
                        <div
                          key={`${groupName}-${subIdx}`}
                          className="text-xs py-0.5 border-l-2 pl-2 flex items-center justify-between"
                          style={{
                            borderColor: getUrgencyLineColor(groupData.urgency, false),
                            opacity: 1,
                          }}
                        >
                          <div className="flex items-center">
                            <span className="font-covered-by-your-grace mr-2 flex-shrink-0 tracking-wider" style={{ color: '#909090', opacity: 1, fontSize: '12px', fontWeight: '500' }}>
                              {groupDates[groupName]}
                            </span>
                            <span className="font-covered-by-your-grace" style={{ opacity: 1 }}>
                              {formatTextWithRedAfterHyphen(subItem)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          // LIST VIEW - only operational notifications
          <>
            {activeNotifications.map((notification) => (
              <SwipeCard key={notification.id} notification={notification}>
                <div className="p-3">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleCardExpansion(notification.id)}
                  >
                    <div className="flex items-center space-x-1 flex-1 min-w-0">
                      <span
                        className="px-2 py-0.5 text-sm font-bold flex-shrink-0 font-covered-by-your-grace tracking-wider"
                        style={{ color: '#909090', opacity: 1, marginLeft: '-8px', fontSize: '12px', fontWeight: 'normal' }}
                      >
                        {notification.date}
                      </span>
                      <span className="text-sm font-bold font-covered-by-your-grace truncate" style={{ opacity: 1, fontSize: '12px' }}>
                        {formatTextWithRedAfterHyphen(notification.title)}
                      </span>
                    </div>

                    {notification.amount && (
                      <span
                        className="text-sm font-bold font-futura flex-shrink-0 ml-4 tracking-wider"
                        style={{ color: '#EB1C24', opacity: 1, fontSize: '14px', fontWeight: '500' }}
                      >
                        {notification.amount}
                      </span>
                    )}
                  </div>

                  {isCardExpanded(notification.id) && (
                    <>
                      <div
                        className="text-red-500 font-bold text-xs mb-3 font-futura overflow-x-auto mt-2 tracking-wider"
                        style={{ color: '#EB1C24', opacity: 1, fontWeight: '500' }}
                      >
                        <div className="w-max pr-2">
                          <div className="w-max pr-2">
                            <div>{notification.timeRemaining && `- ${notification.timeRemaining}`}</div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-3 overflow-x-auto">
                        <div className="w-max pr-2">
                          <div className="space-y-1">
                            {notification.customer && (
                              <>
                                <p className="text-xs font-bold text-black whitespace-nowrap font-covered-by-your-grace" style={{ opacity: 1 }}>
                                  {notification.customer.name}
                                </p>
                                {notification.customer.location && (
                                  <p className="text-xs font-covered-by-your-grace whitespace-nowrap" style={{ opacity: 1 }}>
                                    {notification.customer.location}
                                  </p>
                                )}
                                {notification.customer.tier && (
                                  <p className="text-xs font-covered-by-your-grace whitespace-nowrap" style={{ opacity: 1 }}>
                                    {notification.customer.tier}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                        </div>

                        <div className="w-max pr-2">
                          <div className="space-y-1">
                            {notification.product && (
                              <>
                                <p className="text-xs font-bold text-black whitespace-nowrap font-covered-by-your-grace" style={{ opacity: 1 }}>
                                  {notification.product.name}
                                </p>
                                <p className="text-xs font-covered-by-your-grace whitespace-nowrap" style={{ opacity: 1 }}>
                                  {notification.product.specs}
                                </p>
                                <p className="text-xs font-covered-by-your-grace whitespace-nowrap" style={{ opacity: 1 }}>
                                  {notification.product.color}
                                </p>
                              </>
                            )}
                            {notification.items && (
                              <>
                                <p className="text-xs font-bold text-black whitespace-nowrap font-covered-by-your-grace" style={{ opacity: 1 }}>
                                  LOW STOCK ITEMS
                                </p>
                                {notification.items.map((item, idx) => (
                                  <p key={idx} className="text-xs font-covered-by-your-grace whitespace-nowrap" style={{ opacity: 1 }}>
                                    {item.name}: {item.stock}
                                  </p>
                                ))}
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 overflow-x-auto">
                        <div className="w-max pr-2 flex items-center space-x-4">
                          <button
                            className="bg-red-500 text-white px-3 py-1 text-xs font-bold hover:bg-red-600 transition-colors whitespace-nowrap font-futura tracking-wider"
                            style={{ backgroundColor: '#EB1C24', opacity: 1, fontWeight: '500' }}
                            onClick={() => console.log('Action:', notification.action, notification.id)}
                          >
                            {notification.action}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </SwipeCard>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
