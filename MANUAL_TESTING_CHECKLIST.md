# Manual Testing Checklist

**Before Demo - Complete This Checklist**

---

## ✅ Environment Setup

- [ ] Dev server running: `npm run dev`
- [ ] No console errors in terminal
- [ ] Browser: Chrome or Firefox (latest)
- [ ] Window size: 1920x1080 or larger
- [ ] Network tab open (check for failed requests)

---

## ✅ Dashboard Load (http://localhost:3000/dashboard)

### Initial State
- [ ] Page loads without errors
- [ ] Demo banner visible at top
- [ ] "SyllaBot Demo - VIBE25-4 Hackathon" text
- [ ] "5 Tools Integrated" badge shows
- [ ] "Stack • s2 • Lingo • Cactus • Slate" text visible
- [ ] Inbox header shows "Inbox" title
- [ ] "Your student emails with AI-powered insights" subtitle
- [ ] Email list card visible
- [ ] "Messages (4)" count correct
- [ ] "Sorted chronologically" description visible
- [ ] AI toggle shows "OFF" state
- [ ] 4 emails displayed
- [ ] Jake's email is selected (purple highlight)
- [ ] Student panel on right shows Jake's data

### Email List (AI Toggle OFF)
- [ ] Sarah Chen email visible
- [ ] Jake Martinez email visible (highlighted)
- [ ] Miguel Rodriguez email visible
- [ ] Emma Johnson email visible
- [ ] NO risk badges showing
- [ ] Chronological order (check timestamps)
- [ ] Each email shows:
  - [ ] Student name
  - [ ] Subject line
  - [ ] Preview text (first 2 lines)
  - [ ] Timestamp
  - [ ] Word count
- [ ] Hover changes background color

---

## ✅ AI Toggle Functionality

### Toggle AI ON
- [ ] Click "AI Risk Sorting" button
- [ ] Button turns purple
- [ ] Text changes to "Sorted by risk level"
- [ ] Email list reorders INSTANTLY
- [ ] Jake Martinez moves to position #1
- [ ] Risk badges appear on emails:
  - [ ] Jake: Red badge with "🚨 High Risk"
  - [ ] Sarah: Red/Amber badge
  - [ ] Miguel: Amber/Green badge (or no badge if < 4)
  - [ ] Emma: No badge (risk too low)
- [ ] Confidence percentages show (e.g., "89% confidence")
- [ ] Order is: Jake, Sarah, Miguel, Emma (or similar risk-based)

### Toggle AI OFF
- [ ] Click "AI Risk Sorting" button again
- [ ] Button returns to outline style
- [ ] Text changes back to "Sorted chronologically"
- [ ] Email list reorders back to chronological
- [ ] Risk badges disappear
- [ ] Confidence percentages hide

### Toggle Multiple Times
- [ ] Toggle ON → OFF → ON → OFF works smoothly
- [ ] No flickering or errors
- [ ] State persists correctly

---

## ✅ Email Selection

### Click Different Emails
- [ ] Click Sarah → Right panel updates to Sarah
- [ ] Click Miguel → Right panel updates to Miguel
- [ ] Click Emma → Right panel updates to Emma
- [ ] Click Jake → Right panel updates back to Jake
- [ ] Selected email has purple left border
- [ ] Previously selected email loses highlight
- [ ] Panel updates smoothly (no flash)

---

## ✅ Student Panel - Jake Martinez

### Overview Tab
- [ ] Tab is selected by default
- [ ] Jake's profile photo shows
- [ ] Name: "Jake Martinez"
- [ ] Grade: "Grade 11"
- [ ] Current grade: Shows grade (e.g., "B+")
- [ ] Previous grade: Shows if available

#### Baseline Behavior
- [ ] Attendance: Shows percentage (98%)
- [ ] Avg Grade: Shows percentage (91%)
- [ ] Participation: Shows X/10 (8/10)

#### Red Flags Section
- [ ] "Red Flags (3)" header or similar count
- [ ] 3 red flags displayed:
  1. [ ] "3 absences in past 2 weeks" with "+1400%" badge
  2. [ ] "Quiz score dropped to 60%" with "-33%" badge
  3. [ ] "Message became unusually brief" with "-80%" badge
- [ ] Each flag has:
  - [ ] Description
  - [ ] Deviation badge (color-coded)
  - [ ] Context explanation
- [ ] Red background color
- [ ] Red border

#### AI Analysis
- [ ] Purple background card
- [ ] "Silent Struggle" pattern name
- [ ] "89% confidence" badge (purple)
- [ ] Analysis text (first paragraph visible)
- [ ] Text mentions "high-performing student" or similar

#### Recommended Response
- [ ] Blue background card
- [ ] "Warm Check-In" approach
- [ ] Reasoning text explains why
- [ ] Text mentions showing you notice and care

### Timeline Tab
- [ ] Click "Timeline" tab
- [ ] Tab switches (purple underline)

#### Engagement Timeline Chart
- [ ] Chart header: "Engagement Timeline"
- [ ] "8 weeks" duration label
- [ ] 8 vertical bars displayed
- [ ] Bars show decline from left to right
- [ ] First bar (Sep 15): Green, tall (~95% height)
- [ ] Last bar (Oct 24): Red, very short (~12% height)
- [ ] Bars colored by status:
  - [ ] Green = excellent
  - [ ] Blue = good
  - [ ] Yellow = concerning
  - [ ] Red = crisis
- [ ] Hover over any bar shows tooltip:
  - [ ] Date
  - [ ] Score value
  - [ ] Status label

#### Trend Summary
- [ ] Shows "↓ Declining trend"
- [ ] Shows score change (95 → 12)

#### Legend
- [ ] First date on left (Sep 15)
- [ ] Last date on right (Oct 24)
- [ ] Color legend shows all 4 statuses

#### Projected Outcomes
- [ ] "Projected Outcomes" header
- [ ] Red card: "Without Intervention"
  - [ ] "68% probability" badge
  - [ ] Outcome: "Student drops out or fails class"
  - [ ] Timeframe: "4-8 weeks"
- [ ] Green card: "With Intervention"
  - [ ] "78% probability" badge
  - [ ] Outcome: "Student responds positively..."
  - [ ] Timeframe: "24-48 hours"
- [ ] Purple card: "Window: 24-48 hours optimal"

### Analysis Tab
- [ ] Click "Analysis" tab
- [ ] Tab switches

#### Confidence Breakdown
- [ ] "Confidence Breakdown" header
- [ ] 4 factors listed:
  1. [ ] "Communication Pattern" (95%)
  2. [ ] "Attendance Anomaly" (85%)
  3. [ ] "Grade Trajectory" (72%)
  4. [ ] "Temporal Clustering" (65%)
- [ ] Each factor shows:
  - [ ] Factor name
  - [ ] Weight percentage
  - [ ] Confidence score
  - [ ] Progress bar (color-coded)
  - [ ] Reasoning text with explanation

#### Overall Confidence
- [ ] "Overall Confidence" header
- [ ] "89%" large text in purple
- [ ] Progress bar showing 89%
- [ ] "Weighted average across all factors" label

---

## ✅ Student Panel - Emma Johnson (Calibration Test)

### Switch to Emma
- [ ] Click Emma email in list
- [ ] Panel updates to Emma

### Overview Tab
- [ ] Emma's profile photo
- [ ] Name: "Emma Johnson"
- [ ] Grade: "Grade 11"
- [ ] Current grade shown
- [ ] Baseline: Brief avg word count (12 words)

### Red Flags
- [ ] **NO red flags section** (or empty)
- [ ] This proves calibration: Brief email is normal for Emma

### AI Analysis
- [ ] Pattern: "Normal Behavior"
- [ ] Low confidence score
- [ ] Analysis explains: "matches her baseline"
- [ ] No intervention needed

### Timeline Tab
- [ ] Timeline shows stable/flat pattern
- [ ] Scores around 85-87 (consistent)
- [ ] No dramatic decline

---

## ✅ Console Errors

### Check Browser Console (F12)
- [ ] No red errors in console
- [ ] No yellow warnings (except HMR/dev stuff)
- [ ] No failed network requests (check Network tab)
- [ ] No 404 errors for images
- [ ] No TypeScript errors

---

## ✅ Responsive Design

### Desktop (1920x1080)
- [ ] Email list takes ~2/3 width
- [ ] Student panel takes ~1/3 width
- [ ] All content visible without scrolling

### Laptop (1366x768)
- [ ] Layout still works
- [ ] Sidebar scrolls if needed
- [ ] No horizontal scroll

### Mobile (Optional)
- [ ] Layout stacks vertically (if time)
- [ ] Or shows "Desktop recommended" message

---

## ✅ Performance

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] AI toggle switch < 100ms
- [ ] Email selection < 50ms
- [ ] Tab switching instant
- [ ] No lag when scrolling

### Smoothness
- [ ] Animations smooth (no jank)
- [ ] No flash of unstyled content
- [ ] Images load without delay
- [ ] Text renders crisp

---

## ✅ Demo Flow Test (Run 3 Times)

**Time yourself - must be under 90 seconds**

### Run 1
- [ ] Start at dashboard (AI OFF)
- [ ] Say: "Four emails, all look routine"
- [ ] Toggle AI ON
- [ ] Say: "Jake is now priority"
- [ ] Click Timeline tab
- [ ] Point to 95→12 decline
- [ ] Click Overview
- [ ] Point to red flags
- [ ] Click Analysis
- [ ] Point to 89% confidence
- [ ] Back to Timeline
- [ ] Point to 68% vs 78% outcomes
- [ ] Click Emma
- [ ] Say: "Brief is her baseline"
- [ ] Finish
- [ ] Time: _____ seconds

### Run 2
- [ ] Repeat full flow
- [ ] Practice transitions
- [ ] Time: _____ seconds
- [ ] Should be faster

### Run 3
- [ ] Repeat full flow
- [ ] Perfect execution
- [ ] Time: _____ seconds
- [ ] Should be < 90 seconds

---

## ✅ Edge Cases

### Rapid Clicking
- [ ] Click toggle rapidly 10 times → No crashes
- [ ] Click different emails rapidly → No errors
- [ ] Click tabs rapidly → Smooth switching

### Browser Refresh
- [ ] Refresh page → Loads correctly
- [ ] AI toggle resets to OFF → Correct
- [ ] Jake auto-selected → Correct

### Back Button
- [ ] Click browser back → Returns to home (/)
- [ ] Click forward → Returns to dashboard
- [ ] State preserved

---

## ✅ Final Pre-Demo Check

**Run this 30 minutes before demo**

- [ ] Restart dev server: `npm run dev`
- [ ] Clear browser cache (Cmd+Shift+R)
- [ ] Open http://localhost:3000/dashboard
- [ ] Complete full demo flow
- [ ] No errors in console
- [ ] Close all other tabs (reduce distractions)
- [ ] Maximize browser window
- [ ] Set zoom to 100%
- [ ] Hide bookmarks bar
- [ ] Ready to demo!

---

## 🚨 Known Issues (Document Any Found)

| Issue | Severity | Workaround | Status |
|-------|----------|------------|--------|
| Example: Slow first load | Low | Refresh page | Won't fix |
|  |  |  |  |
|  |  |  |  |

---

## ✅ Success Criteria

**All checks must pass:**
- [x] Bug fixed (STUDENTS.get → STUDENTS[])
- [ ] All unit tests pass (run `npm test`)
- [ ] Dashboard loads without errors
- [ ] AI toggle works perfectly
- [ ] Jake jumps to #1 when AI ON
- [ ] Risk badges show correctly
- [ ] Timeline shows 95→12 decline
- [ ] All 3 tabs work
- [ ] Emma shows low risk (calibration)
- [ ] Demo flow under 90 seconds
- [ ] No console errors
- [ ] Ready to present

**If all ✅ → You're ready to demo! 🎉**
