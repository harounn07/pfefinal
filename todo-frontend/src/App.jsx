import { useEffect, useCallback, useState } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

const API = '/api/todos';

// ── Protected route wrapper ────────────────────────────────
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

// ── Todo app (only renders when logged in) ─────────────────
function TodoApp() {
  const { token, user, logout } = useAuth();
  const navigate                = useNavigate();

  const [todos,   setTodos]   = useState([]);
  const [filter,  setFilter]  = useState('all');
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  // ── Authenticated fetch helper ───────────────────────────
  const authFetch = useCallback((url, options = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });
  }, [token]);

  // ── Fetch todos ──────────────────────────────────────────
  const fetchTodos = useCallback(async () => {
    try {
      const res = await authFetch(API);
      if (res.status === 401) { logout(); navigate('/login'); return; }
      if (!res.ok) throw new Error();
      setTodos(await res.json());
      setError(null);
    } catch {
      setError('Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, [authFetch, logout, navigate]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  // ── Create ───────────────────────────────────────────────
  const addTodo = async (title) => {
    const optimistic = { id: `tmp-${Date.now()}`, title, completed: false };
    setTodos((prev) => [optimistic, ...prev]);
    try {
      const res  = await authFetch(API, {
        method: 'POST',
        body: JSON.stringify({ title }),
      });
      const saved = await res.json();
      setTodos((prev) => prev.map((t) => t.id === optimistic.id ? saved : t));
    } catch {
      setTodos((prev) => prev.filter((t) => t.id !== optimistic.id));
    }
  };

  // ── Toggle ───────────────────────────────────────────────
  const toggleTodo = async (id, completed) => {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed } : t));
    try {
      await authFetch(`${API}/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ completed }),
      });
    } catch {
      setTodos((prev) => prev.map((t) => t.id === id ? { ...t, completed: !completed } : t));
    }
  };

  // ── Delete ───────────────────────────────────────────────
  const deleteTodo = async (id) => {
    const snapshot = todos;
    setTodos((prev) => prev.filter((t) => t.id !== id));
    try {
      await authFetch(`${API}/${id}`, { method: 'DELETE' });
    } catch {
      setTodos(snapshot);
    }
  };

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'done')   return  t.completed;
    return true;
  });

  const activeCount    = todos.filter((t) => !t.completed).length;
  const completedCount = todos.filter((t) =>  t.completed).length;

  return (
    <div className="app">

      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-mark">◆</span>
            <span className="brand-name">TODO</span>
          </div>
          <div className="header-right">
            <div className="stats">
              <span className="stat">
                <span className="stat-num">{activeCount}</span>
                <span className="stat-label">remaining</span>
              </span>
              {completedCount > 0 && (
                <span className="stat">
                  <span className="stat-num">{completedCount}</span>
                  <span className="stat-label">done</span>
                </span>
              )}
            </div>
            <div className="user-area">
              <span className="user-email">{user?.email}</span>
              <button
                className="logout-btn"
                onClick={() => { logout(); navigate('/login'); }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="app-main">
        <div className="container">

          {todos.length > 0 && (
            <div className="filter-bar">
              {['all', 'active', 'done'].map((f) => (
                <button
                  key={f}
                  className={`filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
              {completedCount > 0 && (
                <button
                  className="clear-btn"
                  onClick={() =>
                    todos.filter((t) => t.completed).forEach((t) => deleteTodo(t.id))
                  }
                >
                  clear done
                </button>
              )}
            </div>
          )}

          {loading && (
            <div className="empty-state">
              <span className="loader" />
              <p>Connecting…</p>
            </div>
          )}
          {error && !loading && (
            <div className="empty-state error-state"><p>⚠ {error}</p></div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="empty-state"><p>No tasks yet — add one below.</p></div>
          )}

          {!loading && !error && filtered.map((todo, i) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? 'completed' : ''}`}
              style={{ '--delay': `${i * 30}ms` }}
            >
              <button
                className={`check-btn ${todo.completed ? 'checked' : ''}`}
                onClick={() => toggleTodo(todo.id, !todo.completed)}
              >
                {todo.completed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
              <span className="todo-title">{todo.title}</span>
              <button className="delete-btn" onClick={() => deleteTodo(todo.id)}>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1l10 10M11 1L1 11" stroke="currentColor"
                    strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          ))}

          <form
            className="todo-form"
            onSubmit={(e) => {
              e.preventDefault();
              const input = e.target.elements.title;
              if (input.value.trim()) {
                addTodo(input.value.trim());
                input.value = '';
              }
            }}
          >
            <input
              name="title"
              className="todo-input"
              type="text"
              placeholder="What needs to be done?"
              autoFocus
              maxLength={280}
            />
            <button className="add-btn" type="submit">ADD</button>
          </form>

        </div>
      </main>

      <footer className="app-footer">
        React · Express · PostgreSQL · Distroless
      </footer>
    </div>
  );
}

// ── Root: providers + routes ───────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TodoApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}