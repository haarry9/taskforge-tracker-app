# TaskForge – Collaborative Kanban Board with Dependency Visualizer

### Core Technologies
- Frontend: React, TypeScript, Tailwind CSS, shadcn-ui
- Backend: Supabase (PostgreSQL database)
- State Management: React Query for data fetching and caching
- UI/UX: Responsive design with drag-and-drop functionality (react-beautiful-dnd)

### Key Features
**1. Kanban Board System**
Custom columns representing your workflow stages
Drag-and-drop task cards between columns
Visual indication of task priority and status

**2. Task Dependency System**
How it works: Tasks can depend on other tasks, creating a directed graph relationship
Implementation: Each dependency is stored as a relationship between two tasks
Visualization: Dependencies are displayed as arrows between tasks using SVG bezier curves
Circular Dependency Prevention: The system checks for circular dependencies using relationship detection algorithms to prevent logical loops (e.g., Task A → Task B → Task A)

**3. Task Movement Validation**
When moving a task to the "Complete" column, the system checks if all dependencies are already completed
Uses breadth-first search (BFS) algorithm to traverse the dependency graph and validate all requirements
Prevents tasks from being marked as complete when their prerequisites aren't done

---
### Project Requirements
--
### 👥 User Role: `user`

- All users on board can add/edit cards, set dependencies, and move them across columns.
---

### 🔐 Authentication & Authorization

- Login required
- Board creator controls membership and permissions (this is important)
- Guests can view (if invited) but not edit
---
### 🧱 Core Functional Modules

1. **Board & Column Management**
    - Create board with custom columns (To Do, In Progress, Done, etc.)
    - Invite users via email
2. **Card CRUD & Assignment**
    - Add cards with title, description, assignee, due date
    - Edit/delete permissions scoped
3. **Dependency Linking**
    - On card detail, select other cards as dependencies
    - Store as directed edges
4. **Dependency Visualizer**
    - Graph or arrow overlays on board showing blockers
    - Click edge to view details
5. **Drag & Drop Workflow**
    - Move cards between columns
    - Prevent moving a card to Done if dependencies aren’t complete
6. **Activity Feed & Notifications**
    - Live feed of card moves and new issues
    - In-app toast for assignments or blocked moves
