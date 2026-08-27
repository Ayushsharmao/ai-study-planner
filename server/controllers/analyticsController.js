import { storage } from '../services/storage.js';

export const getAnalytics = (req, res) => {
  try {
    const subjects = storage.getSubjects();
    const deadlines = storage.getDeadlines();
    const sessions = storage.getSessions();
    const availability = storage.getAvailability();

    // 1. Overall stats
    const totalSessions = sessions.length;
    const completedSessions = sessions.filter(s => s.completed);
    const completedCount = completedSessions.length;
    const completionRate = totalSessions > 0 ? Math.round((completedCount / totalSessions) * 100) : 0;

    const totalPlannedMinutes = sessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    const totalActualMinutes = completedSessions.reduce((sum, s) => sum + (s.actualMinutesStudied || s.durationMinutes || 0), 0);

    const totalPlannedHours = (totalPlannedMinutes / 60).toFixed(1);
    const totalActualHours = (totalActualMinutes / 60).toFixed(1);

    // 2. Streak calculation (consecutive days with >= 1 completed session up to today)
    const completedDates = new Set(completedSessions.map(s => s.date));
    let streak = 0;
    const checkDate = new Date();
    
    // Check if today has a completed session
    const todayStr = checkDate.toISOString().split('T')[0];
    let isCurrent = completedDates.has(todayStr);
    
    if (!isCurrent) {
      // Check yesterday to see if active streak was kept
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (completedDates.has(yesterdayStr)) {
        isCurrent = true;
      }
    }

    if (isCurrent) {
      while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        if (completedDates.has(dateStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // 3. Subject-level distribution & readiness
    const subjectStats = subjects.map(sub => {
      const subSessions = sessions.filter(s => s.subjectId === sub.id);
      const subCompleted = subSessions.filter(s => s.completed);
      
      const plannedHrs = subSessions.reduce((sum, s) => sum + (s.durationMinutes || 0), 0) / 60;
      const actualHrs = subCompleted.reduce((sum, s) => sum + (s.actualMinutesStudied || s.durationMinutes || 0), 0) / 60;
      const rate = subSessions.length > 0 ? Math.round((subCompleted.length / subSessions.length) * 100) : 0;

      return {
        id: sub.id,
        name: sub.name,
        code: sub.code,
        color: sub.color,
        difficulty: sub.difficulty,
        totalSessions: subSessions.length,
        completedSessions: subCompleted.length,
        plannedHours: parseFloat(plannedHrs.toFixed(1)),
        actualHours: parseFloat(actualHrs.toFixed(1)),
        completionRate: rate
      };
    });

    // 4. Upcoming Deadlines with Readiness score
    const upcomingDeadlines = deadlines.map(d => {
      const sub = subjects.find(s => s.id === d.subjectId);
      const targetDate = new Date(d.dueDate);
      const today = new Date();
      const daysLeft = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
      
      // Readiness estimate based on subject completion and weight
      const subStat = subjectStats.find(s => s.id === d.subjectId);
      const readiness = subStat ? subStat.completionRate : 50;

      return {
        id: d.id,
        title: d.title,
        type: d.type,
        dueDate: d.dueDate,
        daysLeft,
        weight: d.weight,
        priority: d.priority,
        completed: d.completed,
        subjectName: sub ? sub.name : 'General',
        subjectColor: sub ? sub.color : '#6366f1',
        readiness
      };
    });

    // 5. Daily study pattern (past 7 days + next 7 days)
    const dailyBreakdown = {};
    sessions.forEach(s => {
      if (!dailyBreakdown[s.date]) {
        dailyBreakdown[s.date] = { date: s.date, plannedMins: 0, actualMins: 0, count: 0 };
      }
      dailyBreakdown[s.date].plannedMins += (s.durationMinutes || 0);
      if (s.completed) {
        dailyBreakdown[s.date].actualMins += (s.actualMinutesStudied || s.durationMinutes || 0);
      }
      dailyBreakdown[s.date].count++;
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalSessions,
          completedCount,
          completionRate,
          totalPlannedHours: parseFloat(totalPlannedHours),
          totalActualHours: parseFloat(totalActualHours),
          streak
        },
        subjectStats,
        upcomingDeadlines,
        dailyBreakdown: Object.values(dailyBreakdown).sort((a, b) => a.date.localeCompare(b.date)),
        availabilityWeeklyTotal: Object.values(availability.weeklyHours || {}).reduce((a, b) => a + b, 0)
      }
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
