/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/ec1590b1-4816-4d0d-85d5-c6bde42a4287/files/228dfe3e-f2c8-4787-b507-7c3ef0dd5e2f.jpg";

const AUTH_URL = "https://functions.poehali.dev/a46dd939-0dd8-46dc-94db-a64d06ee086c";
const TOPICS_URL = "https://functions.poehali.dev/161d608e-bcbe-4d8d-9477-a834d663aa1a";
const RATING_URL = "https://functions.poehali.dev/42b42ecf-581e-4a4f-adbf-f4ebf0fc0cb8";

const STATIC_CATEGORIES = [
  { id: 1, icon: "Sword", name: "Общие обсуждения", desc: "Всё об играх и геймплее", color: "#a855f7" },
  { id: 2, icon: "Trophy", name: "Турниры и события", desc: "Соревнования и ивенты", color: "#f59e0b" },
  { id: 3, icon: "Bug", name: "Баги и фидбэк", desc: "Репорты и предложения", color: "#ef4444" },
  { id: 4, icon: "Users", name: "Поиск команды", desc: "Набор игроков в клан", color: "#00f5ff" },
  { id: 5, icon: "BookOpen", name: "Гайды и билды", desc: "Стратегии и тактики", color: "#39ff14" },
  { id: 6, icon: "Star", name: "Фан-арт и медиа", desc: "Творчество сообщества", color: "#f97316" },
];

const achievements = [
  { icon: "💬", name: "Болтун", desc: "100 сообщений", color: "#a855f7" },
  { icon: "🔥", name: "На огне", desc: "7 дней подряд", color: "#ef4444" },
  { icon: "⚔️", name: "Ветеран", desc: "1 год на форуме", color: "#f59e0b" },
  { icon: "🏆", name: "Чемпион", desc: "Победа в турнире", color: "#39ff14" },
  { icon: "👑", name: "Авторитет", desc: "500 лайков", color: "#00f5ff" },
  { icon: "🌟", name: "Звезда", desc: "1000 подписчиков", color: "#f97316" },
];

const navItems = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "categories", label: "Категории", icon: "LayoutGrid" },
  { id: "topics", label: "Темы", icon: "MessageSquare" },
  { id: "rating", label: "Рейтинг", icon: "Trophy" },
  { id: "search", label: "Поиск", icon: "Search" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "contacts", label: "Контакты", icon: "Mail" },
];

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "только что";
  if (diff < 3600) return `${Math.floor(diff / 60)} мин`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч`;
  return `${Math.floor(diff / 86400)} д`;
}

async function api(url: string, params: Record<string, string> = {}, options: RequestInit = {}, token?: string) {
  const qs = new URLSearchParams(params).toString();
  const fullUrl = qs ? `${url}?${qs}` : url;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["X-Auth-Token"] = token;
  const res = await fetch(fullUrl, { ...options, headers: { ...headers, ...(options.headers as Record<string, string> || {}) } });
  const text = await res.text();
  try {
    const data = JSON.parse(text);
    return { ok: res.ok, status: res.status, data };
  } catch {
    return { ok: false, status: res.status, data: { error: text } };
  }
}

type Topic = {
  id: number; title: string; content: string; views: number;
  replies_count: number; is_hot: boolean; created_at: string;
  category_id: number; author: string; avatar: string; category_name: string;
};

function TopicRow({ topic, onClick }: { topic: Topic; onClick?: () => void }) {
  return (
    <div className="game-card rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer" onClick={onClick}>
      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg shrink-0 border border-border">
        {topic.avatar || "🎮"}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          {topic.is_hot && (
            <span className="text-xs px-1.5 py-0.5 rounded font-gaming font-bold text-white" style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.4)" }}>HOT</span>
          )}
          {topic.category_name && (
            <span className="text-xs text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded">{topic.category_name}</span>
          )}
        </div>
        <div className="text-white text-sm font-medium truncate hover:text-neon-purple transition-colors">{topic.title}</div>
        <div className="text-muted-foreground text-xs mt-0.5">от <span className="text-neon-cyan">{topic.author}</span> · {timeAgo(topic.created_at)}</div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1"><Icon name="MessageSquare" size={12} />{topic.replies_count}</span>
        <span className="hidden sm:flex items-center gap-1"><Icon name="Eye" size={12} />{topic.views}</span>
      </div>
    </div>
  );
}

function AuthModal({ mode, onClose, onSwitch, onSuccess }: {
  mode: "login" | "register"; onClose: () => void; onSwitch: () => void;
  onSuccess: (token: string, user: any) => void;
}) {
  const [form, setForm] = useState({ username: "", email: "", password: "", password2: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (mode === "register" && form.password !== form.password2) { setError("Пароли не совпадают"); return; }
    setLoading(true);
    const action = mode === "register" ? "register" : "login";
    const body = mode === "register"
      ? { username: form.username, email: form.email, password: form.password }
      : { email: form.email, password: form.password };
    const r = await api(AUTH_URL, { action }, { method: "POST", body: JSON.stringify(body) });
    setLoading(false);
    if (!r.ok || r.data.error) { setError(r.data.error || "Ошибка сервера"); return; }
    onSuccess(r.data.token, r.data.user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md neon-border rounded-xl p-8 animate-scale-in" style={{ background: "hsl(220,20%,8%)" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors"><Icon name="X" size={20} /></button>
        <div className="text-center mb-8">
          <div className="font-gaming text-2xl font-bold neon-purple mb-1">{mode === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}</div>
          <div className="text-muted-foreground text-sm">{mode === "login" ? "Войди в своё игровое измерение" : "Создай аккаунт воина"}</div>
        </div>
        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Никнейм</label>
              <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="Твой игровой ник" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Пароль</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              onKeyDown={e => e.key === "Enter" && submit()}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="••••••••" />
          </div>
          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Повтори пароль</label>
              <input type="password" value={form.password2} onChange={e => setForm(f => ({ ...f, password2: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && submit()}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="••••••••" />
            </div>
          )}
          {error && <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</div>}
          <button onClick={submit} disabled={loading} className="btn-gaming w-full py-3 rounded-lg font-display tracking-widest text-sm mt-2 disabled:opacity-60">
            {loading ? "Загрузка..." : mode === "login" ? "ВОЙТИ" : "СОЗДАТЬ АККАУНТ"}
          </button>
        </div>
        <div className="text-center mt-6 text-sm text-muted-foreground">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <button onClick={onSwitch} className="text-neon-purple hover:text-neon-cyan transition-colors font-medium">
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </button>
        </div>
      </div>
    </div>
  );
}

function NewTopicModal({ onClose, token, categories, onCreated }: {
  onClose: () => void; token: string; categories: any[]; onCreated: () => void;
}) {
  const [form, setForm] = useState({ title: "", content: "", category_id: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    if (!form.title.trim() || !form.content.trim()) { setError("Заполни заголовок и текст"); return; }
    setLoading(true);
    const r = await api(TOPICS_URL, { action: "create" }, {
      method: "POST",
      body: JSON.stringify({ title: form.title, content: form.content, category_id: form.category_id ? Number(form.category_id) : null })
    }, token);
    setLoading(false);
    if (!r.ok || r.data.error) { setError(r.data.error || "Ошибка"); return; }
    onCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-xl neon-border rounded-xl p-8 animate-scale-in" style={{ background: "hsl(220,20%,8%)" }} onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white"><Icon name="X" size={20} /></button>
        <div className="font-gaming text-xl font-bold neon-purple mb-6">НОВАЯ ТЕМА</div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Заголовок</label>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple placeholder:text-muted-foreground" placeholder="Название темы..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Категория</label>
            <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple">
              <option value="">— Выбери категорию —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Текст</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple resize-none h-32 placeholder:text-muted-foreground" placeholder="Опиши свою тему..." />
          </div>
          {error && <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-2">{error}</div>}
          <button onClick={submit} disabled={loading} className="btn-gaming w-full py-3 rounded-lg font-display tracking-widest text-sm disabled:opacity-60">
            {loading ? "Публикую..." : "ОПУБЛИКОВАТЬ"}
          </button>
        </div>
      </div>
    </div>
  );
}

function TopicView({ topic, token, user, onBack }: { topic: Topic; token: string; user: any; onBack: () => void }) {
  const [posts, setPosts] = useState<any[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const r = await api(TOPICS_URL, { action: "get", id: String(topic.id) });
    setLoading(false);
    if (r.ok) setPosts(r.data.posts || []);
  }, [topic.id]);

  useEffect(() => { load(); }, [load]);

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true); setError("");
    const r = await api(TOPICS_URL, { action: "reply" }, { method: "POST", body: JSON.stringify({ topic_id: topic.id, content: reply }) }, token);
    setSending(false);
    if (!r.ok || r.data.error) { setError(r.data.error || "Ошибка"); return; }
    setReply(""); load();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl text-white truncate">{topic.title}</h2>
          <div className="text-xs text-muted-foreground">от <span className="text-neon-cyan">{topic.author}</span> · {timeAgo(topic.created_at)}</div>
        </div>
      </div>
      <div className="game-card rounded-xl p-5 mb-4">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl border border-border shrink-0">{topic.avatar || "🎮"}</div>
          <div>
            <div className="text-neon-cyan text-sm font-semibold mb-1">{topic.author}</div>
            <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{topic.content}</div>
          </div>
        </div>
      </div>
      {loading && <div className="text-center py-6 text-muted-foreground text-sm">Загрузка...</div>}
      {posts.map(p => (
        <div key={p.id} className="game-card rounded-xl p-4 mb-2">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-base border border-border shrink-0">{p.avatar || "🎮"}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-neon-cyan text-xs font-semibold">{p.author}</span>
                <span className="text-muted-foreground text-xs">{timeAgo(p.created_at)}</span>
              </div>
              <div className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{p.content}</div>
            </div>
          </div>
        </div>
      ))}
      {user ? (
        <div className="mt-6 game-card rounded-xl p-4">
          <label className="text-xs text-muted-foreground uppercase tracking-widest mb-2 block font-gaming">Твой ответ</label>
          <textarea value={reply} onChange={e => setReply(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple resize-none h-24 placeholder:text-muted-foreground text-sm"
            placeholder="Напиши свой ответ..." />
          {error && <div className="text-red-400 text-xs mt-1">{error}</div>}
          <button onClick={sendReply} disabled={sending || !reply.trim()} className="btn-gaming mt-3 px-6 py-2 rounded-lg text-sm font-display tracking-wider disabled:opacity-60">
            {sending ? "Отправляю..." : "ОТВЕТИТЬ"}
          </button>
        </div>
      ) : (
        <div className="mt-6 text-center py-4 text-muted-foreground text-sm">Войди, чтобы ответить</div>
      )}
    </div>
  );
}

function ProfilePage({ user, token, onClose, onLogout, onUpdate }: {
  user: any; token: string; onClose: () => void; onLogout: () => void; onUpdate: (u: any) => void;
}) {
  const [form, setForm] = useState({ username: user.username, bio: user.bio || "", favorite_game: user.favorite_game || "", avatar_emoji: user.avatar_emoji });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const AVATARS = ["🎮", "⚡", "🔥", "⚔️", "🐺", "🏆", "🗺️", "🌟", "👑", "🎯", "🛡️", "🚀"];

  const save = async () => {
    setSaving(true);
    const r = await api(AUTH_URL, { action: "profile" }, { method: "POST", body: JSON.stringify(form) }, token);
    setSaving(false);
    if (r.ok) { onUpdate({ ...user, ...form }); setSaved(true); setTimeout(() => setSaved(false), 2000); }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onClose} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
        <h2 className="font-display text-2xl text-white">ПРОФИЛЬ ИГРОКА</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="game-card rounded-xl p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-4xl mx-auto animate-float" style={{ boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}>
                {form.avatar_emoji}
              </div>
              <div className="absolute bottom-0 right-0 online-dot border-2 border-background rounded-full" />
            </div>
            <div className="font-display text-xl text-white mb-1">{user.username}</div>
            <div className="text-muted-foreground text-sm mb-3">Уровень {user.level}</div>
            <span className={`text-white text-xs px-3 py-1 rounded-full font-gaming font-bold ${user.badge === "legendary" ? "badge-legendary" : user.badge === "epic" ? "badge-epic" : "badge-rare"}`}>
              {user.badge?.toUpperCase() || "НОВИЧОК"}
            </span>
          </div>
          <div className="game-card rounded-xl p-5">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Статистика</div>
            <div className="space-y-3">
              {[{ label: "Уровень", value: user.level, icon: "⚡" }, { label: "XP", value: (user.xp || 0).toLocaleString(), icon: "⭐" }, { label: "Постов", value: user.posts_count || 0, icon: "💬" }].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{s.icon} {s.label}</span>
                  <span className="font-gaming text-sm text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="game-card rounded-xl p-5">
            <div className="flex justify-between mb-2">
              <span className="font-gaming text-xs text-muted-foreground">LVL {user.level}</span>
              <span className="font-gaming text-xs text-neon-cyan">LVL {user.level + 1}</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="xp-bar h-full rounded-full" style={{ width: `${Math.min(((user.xp || 0) % 1000) / 10, 100)}%` }} />
            </div>
            <div className="text-right mt-1 text-xs text-muted-foreground">{user.xp || 0} XP</div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="game-card rounded-xl p-6">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Редактировать профиль</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Никнейм</label>
                <input value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Любимая игра</label>
                <input value={form.favorite_game} onChange={e => setForm(f => ({ ...f, favorite_game: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm" placeholder="Название игры" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">О себе</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm resize-none h-20" placeholder="Расскажи о себе..." />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-2 block">Аватар</label>
                <div className="flex flex-wrap gap-2">
                  {AVATARS.map(a => (
                    <button key={a} onClick={() => setForm(f => ({ ...f, avatar_emoji: a }))}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${form.avatar_emoji === a ? "border-2 border-neon-purple bg-primary/20" : "border border-border bg-secondary hover:border-neon-purple/50"}`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={save} disabled={saving} className="btn-gaming px-6 py-2 rounded-lg text-sm font-display tracking-wider disabled:opacity-60">
                {saving ? "Сохраняю..." : saved ? "✓ СОХРАНЕНО!" : "СОХРАНИТЬ"}
              </button>
              <button onClick={onLogout} className="border border-red-500/40 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg text-sm transition-colors">Выйти</button>
            </div>
          </div>
          <div className="game-card rounded-xl p-6">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Достижения</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map(a => (
                <div key={a.name} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 border border-border hover:border-neon-purple/40 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: a.color + "22", border: `1px solid ${a.color}44` }}>{a.icon}</div>
                  <div>
                    <div className="text-white text-xs font-semibold">{a.name}</div>
                    <div className="text-muted-foreground text-xs">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsPage({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onClose} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
        <h2 className="font-display text-2xl text-white">КОНТАКТЫ</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <div className="game-card rounded-xl p-6 space-y-4">
          <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest">Напиши нам</div>
          {sent ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <div className="text-white font-semibold">Сообщение отправлено!</div>
              <button onClick={() => setSent(false)} className="mt-4 text-neon-purple text-sm hover:text-neon-cyan">Написать ещё</button>
            </div>
          ) : (
            <>
              <div><label className="text-xs text-muted-foreground mb-1 block">Имя</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm placeholder:text-muted-foreground" placeholder="Твой ник" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Email</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm placeholder:text-muted-foreground" placeholder="email@example.com" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Сообщение</label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm resize-none h-28 placeholder:text-muted-foreground" placeholder="Твоё сообщение..." /></div>
              <button onClick={() => form.name && form.email && form.message && setSent(true)} className="btn-gaming w-full py-2.5 rounded-lg font-display tracking-wider text-sm">ОТПРАВИТЬ</button>
            </>
          )}
        </div>
        <div className="space-y-4">
          {[
            { icon: "Gamepad2", label: "Discord", value: "discord.gg/stalshield", color: "#5865f2" },
            { icon: "Send", label: "Telegram", value: "@stalshieldforum", color: "#00f5ff" },
            { icon: "Mail", label: "Email", value: "support@stalshield.gg", color: "#a855f7" },
            { icon: "Youtube", label: "YouTube", value: "Stalshield Forum", color: "#ef4444" },
          ].map(c => (
            <div key={c.label} className="game-card rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: c.color + "22", border: `1px solid ${c.color}44` }}>
                <Icon name={c.icon} size={18} style={{ color: c.color }} />
              </div>
              <div>
                <div className="font-gaming text-xs text-muted-foreground">{c.label}</div>
                <div className="text-sm text-white">{c.value}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [activePage, setActivePage] = useState("home");
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [newTopic, setNewTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [token, setToken] = useState(() => localStorage.getItem("stalshield_token") || "");
  const [user, setUser] = useState<any>(() => { const s = localStorage.getItem("stalshield_user"); return s ? JSON.parse(s) : null; });
  const [topics, setTopics] = useState<Topic[]>([]);
  const [categories, setCategories] = useState<any[]>(STATIC_CATEGORIES);
  const [ratingUsers, setRatingUsers] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [loadingTopics, setLoadingTopics] = useState(false);

  const loadTopics = useCallback(async () => {
    setLoadingTopics(true);
    const r = await api(TOPICS_URL, { action: "list" });
    setLoadingTopics(false);
    if (r.ok) setTopics(r.data.topics || []);
  }, []);

  const loadCategories = useCallback(async () => {
    const r = await api(TOPICS_URL, { action: "categories" });
    if (r.ok && r.data.categories?.length > 0) {
      const merged = STATIC_CATEGORIES.map(sc => { const found = r.data.categories.find((c: any) => c.id === sc.id); return found ? { ...sc, ...found } : sc; });
      setCategories(merged);
    }
  }, []);

  const loadRating = useCallback(async () => {
    const r = await api(RATING_URL, {});
    if (r.ok) setRatingUsers(r.data.users || []);
  }, []);

  useEffect(() => { loadTopics(); loadCategories(); }, [loadTopics, loadCategories]);
  useEffect(() => { if (activePage === "rating") loadRating(); }, [activePage, loadRating]);

  const handleAuthSuccess = (newToken: string, newUser: any) => {
    setToken(newToken); setUser(newUser);
    localStorage.setItem("stalshield_token", newToken);
    localStorage.setItem("stalshield_user", JSON.stringify(newUser));
    setAuthModal(null);
  };

  const handleLogout = async () => {
    await api(AUTH_URL, { action: "logout" }, { method: "POST" }, token);
    setToken(""); setUser(null);
    localStorage.removeItem("stalshield_token"); localStorage.removeItem("stalshield_user");
    setActivePage("home");
  };

  const handleUserUpdate = (u: any) => { setUser(u); localStorage.setItem("stalshield_user", JSON.stringify(u)); };
  const requireAuth = (cb: () => void) => { if (!user) { setAuthModal("login"); return; } cb(); };
  const filteredTopics = searchQuery ? topics.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.author.toLowerCase().includes(searchQuery.toLowerCase())) : topics;

  return (
    <div className="min-h-screen bg-background grid-bg">
      {authModal && <AuthModal mode={authModal} onClose={() => setAuthModal(null)} onSwitch={() => setAuthModal(authModal === "login" ? "register" : "login")} onSuccess={handleAuthSuccess} />}
      {newTopic && <NewTopicModal onClose={() => setNewTopic(false)} token={token} categories={categories} onCreated={loadTopics} />}

      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl" style={{ background: "hsla(220,20%,6%,0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button onClick={() => { setActivePage("home"); setSelectedTopic(null); }} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white font-gaming" style={{ boxShadow: "0 0 12px rgba(168,85,247,0.5)" }}>S</div>
            <span className="font-gaming text-base font-bold hidden sm:block" style={{ color: "#a855f7", textShadow: "0 0 10px rgba(168,85,247,0.5)" }}>STALSHIELD</span>
          </button>
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActivePage(item.id); setSelectedTopic(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activePage === item.id ? "bg-primary/15 text-neon-purple" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}>
                <Icon name={item.icon} size={14} />{item.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => requireAuth(() => setNewTopic(true))} className="btn-gaming hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs">
              <Icon name="Plus" size={14} /><span>Тема</span>
            </button>
            {user ? (
              <button onClick={() => setActivePage("profile")} className="flex items-center gap-2 border border-border hover:border-neon-purple/40 px-3 py-1.5 rounded-lg transition-all">
                <span className="text-base">{user.avatar_emoji}</span>
                <span className="text-sm text-white hidden sm:block font-medium">{user.username}</span>
              </button>
            ) : (
              <>
                <button onClick={() => setAuthModal("login")} className="hidden sm:block border border-border text-muted-foreground hover:text-white hover:border-neon-purple/40 px-4 py-2 rounded-lg text-xs font-gaming transition-all">ВОЙТИ</button>
                <button onClick={() => setAuthModal("register")} className="btn-gaming px-3 py-2 rounded-lg text-xs hidden sm:block">РЕГИСТРАЦИЯ</button>
              </>
            )}
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden text-muted-foreground hover:text-white p-1">
              <Icon name={mobileMenu ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>
        {mobileMenu && (
          <div className="lg:hidden border-t border-border px-4 py-3 space-y-1 animate-fade-in" style={{ background: "hsl(220,20%,7%)" }}>
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setActivePage(item.id); setSelectedTopic(null); setMobileMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${activePage === item.id ? "bg-primary/15 text-neon-purple" : "text-muted-foreground hover:text-white"}`}>
                <Icon name={item.icon} size={16} />{item.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2 border-t border-border">
              {user ? (
                <button onClick={() => { setActivePage("profile"); setMobileMenu(false); }} className="flex-1 btn-gaming py-2 rounded-lg text-xs">{user.avatar_emoji} {user.username}</button>
              ) : (
                <>
                  <button onClick={() => { setAuthModal("login"); setMobileMenu(false); }} className="flex-1 border border-border text-muted-foreground py-2 rounded-lg text-xs font-gaming">ВОЙТИ</button>
                  <button onClick={() => { setAuthModal("register"); setMobileMenu(false); }} className="flex-1 btn-gaming py-2 rounded-lg text-xs">РЕГИСТРАЦИЯ</button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activePage === "profile" && user && <ProfilePage user={user} token={token} onClose={() => setActivePage("home")} onLogout={handleLogout} onUpdate={handleUserUpdate} />}
        {activePage === "profile" && !user && (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🛡️</div>
            <div className="font-display text-xl text-white mb-3">Нужно войти</div>
            <button onClick={() => setAuthModal("login")} className="btn-gaming px-6 py-3 rounded-xl">ВОЙТИ В АККАУНТ</button>
          </div>
        )}
        {activePage === "contacts" && <ContactsPage onClose={() => setActivePage("home")} />}

        {activePage === "search" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setActivePage("home")} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
              <h2 className="font-display text-2xl text-white">ПОИСК</h2>
            </div>
            <div className="max-w-2xl mb-8">
              <div className="relative">
                <Icon name="Search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:border-neon-purple text-base placeholder:text-muted-foreground transition-colors"
                  placeholder="Поиск тем, авторов..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="space-y-2">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground"><div className="text-4xl mb-3">🔍</div><div>Ничего не найдено</div></div>
              ) : filteredTopics.map(t => <TopicRow key={t.id} topic={t} onClick={() => { setSelectedTopic(t); setActivePage("topics"); }} />)}
            </div>
          </div>
        )}

        {activePage === "rating" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setActivePage("home")} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
              <h2 className="font-display text-2xl text-white">РЕЙТИНГ ИГРОКОВ</h2>
            </div>
            {ratingUsers.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground"><div className="text-4xl mb-3">🏆</div><div>Зарегистрируйся первым!</div></div>
            ) : (
              <div className="max-w-2xl space-y-3">
                {ratingUsers.map((u, i) => (
                  <div key={u.id} className="game-card rounded-xl p-4 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center font-gaming font-bold text-lg" style={{ background: i < 3 ? "rgba(245,158,11,0.1)" : "transparent", border: i < 3 ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent" }}>
                      {i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : <span className="text-muted-foreground text-sm">{u.rank}</span>}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/40 to-cyan-500/40 flex items-center justify-center text-xl border border-border">{u.avatar_emoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">{u.username}</div>
                      <div className="text-xs text-muted-foreground">Уровень {u.level} · {u.posts_count} постов</div>
                    </div>
                    <div className="text-right">
                      <div className="font-gaming text-sm text-neon-cyan">{(u.xp || 0).toLocaleString()} XP</div>
                      <span className={`text-xs px-1.5 py-0.5 rounded text-white font-bold ${u.badge === "legendary" ? "badge-legendary" : u.badge === "epic" ? "badge-epic" : "badge-rare"}`}>
                        {(u.badge || "new").slice(0, 3).toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activePage === "topics" && (
          <div className="animate-fade-in">
            {selectedTopic ? (
              <TopicView topic={selectedTopic} token={token} user={user} onBack={() => setSelectedTopic(null)} />
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setActivePage("home")} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
                    <h2 className="font-display text-2xl text-white">ВСЕ ТЕМЫ</h2>
                  </div>
                  <button onClick={() => requireAuth(() => setNewTopic(true))} className="btn-gaming flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                    <Icon name="Plus" size={16} /> Новая тема
                  </button>
                </div>
                {loadingTopics && <div className="text-center py-10 text-muted-foreground">Загрузка...</div>}
                {!loadingTopics && topics.length === 0 && (
                  <div className="text-center py-20 text-muted-foreground">
                    <div className="text-5xl mb-4">💬</div>
                    <div className="font-display text-xl text-white mb-2">Тем пока нет</div>
                    <div className="mb-4">Будь первым, кто создаст тему!</div>
                    <button onClick={() => requireAuth(() => setNewTopic(true))} className="btn-gaming px-6 py-3 rounded-xl">СОЗДАТЬ ТЕМУ</button>
                  </div>
                )}
                <div className="space-y-2">
                  {topics.map((t, i) => (
                    <div key={t.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                      <TopicRow topic={t} onClick={() => setSelectedTopic(t)} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {activePage === "categories" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setActivePage("home")} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
              <h2 className="font-display text-2xl text-white">КАТЕГОРИИ</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {categories.map((cat, i) => (
                <div key={cat.id} className="game-card rounded-xl p-5 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }} onClick={() => setActivePage("topics")}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.color + "22", border: `1px solid ${cat.color}44` }}>
                      <Icon name={cat.icon} size={24} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-0.5">{cat.name}</div>
                      <div className="text-muted-foreground text-sm">{cat.desc || cat.description}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-gaming text-neon-purple">{cat.topics_count || 0}</div>
                      <div className="text-muted-foreground text-xs">тем</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "home" && (
          <div className="space-y-10 animate-fade-in">
            <section className="relative rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
              <img src={HERO_IMAGE} alt="Stalshield Forum" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end" style={{ minHeight: 320 }}>
                <div className="font-gaming text-xs text-neon-cyan uppercase tracking-[0.3em] mb-3">Добро пожаловать в</div>
                <h1 className="font-display text-4xl md:text-6xl text-white mb-3 glitch" style={{ textShadow: "0 0 30px rgba(168,85,247,0.5)" }}>STALSHIELD FORUM</h1>
                <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-lg">Игровое сообщество для настоящих воинов. Обсуждай, делись опытом, побеждай вместе.</p>
                <div className="flex flex-wrap gap-3">
                  {user ? (
                    <button onClick={() => requireAuth(() => setNewTopic(true))} className="btn-gaming flex items-center gap-2 px-6 py-3 rounded-xl"><Icon name="Plus" size={16} /> Создать тему</button>
                  ) : (
                    <button onClick={() => setAuthModal("register")} className="btn-gaming flex items-center gap-2 px-6 py-3 rounded-xl"><Icon name="Zap" size={16} /> Присоединиться</button>
                  )}
                  <button onClick={() => setActivePage("topics")} className="border border-border text-white hover:border-neon-cyan/50 px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5">Смотреть темы</button>
                </div>
              </div>
            </section>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Тем", value: topics.length, icon: "💬", color: "#a855f7" },
                { label: "Категорий", value: categories.length, icon: "📂", color: "#00f5ff" },
                { label: "Ответов", value: topics.reduce((a, t) => a + t.replies_count, 0), icon: "📝", color: "#39ff14" },
                { label: "Просмотров", value: topics.reduce((a, t) => a + t.views, 0), icon: "👁️", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className="game-card rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-gaming text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg text-white flex items-center gap-2"><span className="text-neon-orange">🔥</span> Последние темы</h2>
                  <button onClick={() => setActivePage("topics")} className="text-neon-purple text-xs hover:text-neon-cyan transition-colors font-gaming">ВСЕ ТЕМЫ →</button>
                </div>
                {loadingTopics && <div className="text-muted-foreground text-sm py-4">Загрузка...</div>}
                {!loadingTopics && topics.length === 0 && (
                  <div className="game-card rounded-xl p-8 text-center text-muted-foreground">
                    <div className="text-3xl mb-2">💬</div>
                    <div className="text-sm">Тем пока нет — будь первым!</div>
                    <button onClick={() => requireAuth(() => setNewTopic(true))} className="mt-3 btn-gaming px-4 py-2 rounded-lg text-xs">Создать тему</button>
                  </div>
                )}
                <div className="space-y-2">
                  {topics.slice(0, 5).map((t, i) => (
                    <div key={t.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
                      <TopicRow topic={t} onClick={() => { setSelectedTopic(t); setActivePage("topics"); }} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-5">
                <div className="game-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-gaming text-xs text-muted-foreground uppercase tracking-widest">Топ игроки</span>
                    <button onClick={() => setActivePage("rating")} className="text-neon-purple text-xs hover:text-neon-cyan font-gaming">→ ВСЕ</button>
                  </div>
                  {ratingUsers.length === 0 ? (
                    <div className="text-muted-foreground text-xs text-center py-3">Зарегистрируйся первым!</div>
                  ) : (
                    <div className="space-y-3">
                      {ratingUsers.slice(0, 3).map(u => (
                        <div key={u.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/40 to-cyan-500/40 flex items-center justify-center text-base border border-border">{u.avatar_emoji}</div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate">{u.username}</div>
                            <div className="flex items-center gap-1 mt-0.5">
                              <div className="h-1 bg-secondary rounded-full flex-1 overflow-hidden">
                                <div className="xp-bar h-full" style={{ width: `${Math.min(((u.xp || 0) % 1000) / 10, 100)}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">{u.level} lvl</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="game-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-gaming text-xs text-muted-foreground uppercase tracking-widest">Категории</span>
                    <button onClick={() => setActivePage("categories")} className="text-neon-purple text-xs hover:text-neon-cyan font-gaming">→ ВСЕ</button>
                  </div>
                  <div className="space-y-2">
                    {categories.slice(0, 4).map(c => (
                      <button key={c.id} onClick={() => setActivePage("topics")} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ background: c.color + "22" }}>
                          <Icon name={c.icon} size={14} style={{ color: c.color }} />
                        </div>
                        <span className="text-sm text-foreground flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.topics_count || 0}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="game-card rounded-xl p-5">
                  <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Система достижений</div>
                  <div className="grid grid-cols-3 gap-2">
                    {achievements.map(a => (
                      <div key={a.name} title={`${a.name}: ${a.desc}`} className="flex flex-col items-center p-2 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors" style={{ border: `1px solid ${a.color}22` }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg mb-1" style={{ background: a.color + "18" }}>{a.icon}</div>
                        <div className="text-xs text-muted-foreground text-center leading-tight">{a.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-border mt-16 py-8" style={{ background: "hsl(220,20%,5%)" }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-gaming font-bold text-white">S</div>
            <span className="font-gaming text-sm" style={{ color: "#a855f7" }}>STALSHIELD FORUM</span>
          </div>
          <div className="text-muted-foreground text-xs">© 2026 Stalshield Forum. Все права защищены.</div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <button className="hover:text-white transition-colors">Правила</button>
            <button className="hover:text-white transition-colors">Конфиденциальность</button>
            <button onClick={() => setActivePage("contacts")} className="hover:text-white transition-colors">Контакты</button>
          </div>
        </div>
      </footer>
    </div>
  );
}