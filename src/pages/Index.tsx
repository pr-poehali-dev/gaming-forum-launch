import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMAGE = "https://cdn.poehali.dev/projects/ec1590b1-4816-4d0d-85d5-c6bde42a4287/files/228dfe3e-f2c8-4787-b507-7c3ef0dd5e2f.jpg";

// --- DATA ---
const categories = [
  { id: 1, icon: "Sword", name: "Общие обсуждения", desc: "Всё об играх и геймплее", topics: 1284, posts: 38420, color: "#a855f7" },
  { id: 2, icon: "Trophy", name: "Турниры и события", desc: "Соревнования и ивенты", topics: 342, posts: 9870, color: "#f59e0b" },
  { id: 3, icon: "Bug", name: "Баги и фидбэк", desc: "Репорты и предложения", topics: 891, posts: 12300, color: "#ef4444" },
  { id: 4, icon: "Users", name: "Поиск команды", desc: "Набор игроков в клан", topics: 567, posts: 4210, color: "#00f5ff" },
  { id: 5, icon: "BookOpen", name: "Гайды и билды", desc: "Стратегии и тактики", topics: 723, posts: 21000, color: "#39ff14" },
  { id: 6, icon: "Star", name: "Фан-арт и медиа", desc: "Творчество сообщества", topics: 445, posts: 8900, color: "#f97316" },
];

const topics = [
  { id: 1, title: "ТОП-10 лучших билдов сезона 2026", author: "NeXus_Pro", avatar: "⚡", time: "5 мин", replies: 42, views: 1280, hot: true, category: "Гайды" },
  { id: 2, title: "Баг с невидимостью в подземелье Скрамга — СРОЧНО", author: "ShadowHunter", avatar: "🔥", time: "12 мин", replies: 89, views: 3400, hot: true, category: "Баги" },
  { id: 3, title: "Набор в клан [STORM] — нужны хилеры 60+", author: "StormLeader", avatar: "⚔️", time: "1 час", replies: 23, views: 670, hot: false, category: "Команда" },
  { id: 4, title: "Официальное расписание турнира NEXUS CUP 2026", author: "GameMaster", avatar: "🏆", time: "2 часа", replies: 156, views: 8900, hot: true, category: "Турниры" },
  { id: 5, title: "Впечатления после обновления 4.2 — делитесь!", author: "Pixel_Wolf", avatar: "🐺", time: "3 часа", replies: 67, views: 2100, hot: false, category: "Общее" },
  { id: 6, title: "Секретная локация в лесу Эльвара — найдена!", author: "ExplorerX", avatar: "🗺️", time: "4 часа", replies: 34, views: 1560, hot: false, category: "Общее" },
];

const topUsers = [
  { rank: 1, name: "NeXus_Pro", avatar: "⚡", xp: 48200, level: 87, badge: "legendary", badgeName: "Легенда" },
  { rank: 2, name: "ShadowHunter", avatar: "🔥", xp: 41500, level: 79, badge: "legendary", badgeName: "Мифик" },
  { rank: 3, name: "Pixel_Wolf", avatar: "🐺", xp: 38900, level: 74, badge: "epic", badgeName: "Эпик" },
  { rank: 4, name: "StormLeader", avatar: "⚔️", xp: 31200, level: 68, badge: "epic", badgeName: "Эпик" },
  { rank: 5, name: "ExplorerX", avatar: "🗺️", xp: 27800, level: 61, badge: "rare", badgeName: "Редкий" },
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

// --- TOPIC ROW ---
function TopicRow({ topic }: { topic: typeof topics[0] }) {
  return (
    <div className="game-card rounded-xl px-4 py-3 flex items-center gap-3 cursor-pointer">
      <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center text-lg shrink-0 border border-border">
        {topic.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {topic.hot && (
            <span className="text-xs px-1.5 py-0.5 rounded font-gaming font-bold text-white" style={{ background: "rgba(239,68,68,0.3)", border: "1px solid rgba(239,68,68,0.4)" }}>HOT</span>
          )}
          <span className="text-xs text-muted-foreground border border-border/50 px-1.5 py-0.5 rounded">{topic.category}</span>
        </div>
        <div className="text-white text-sm font-medium truncate hover:text-neon-purple transition-colors">{topic.title}</div>
        <div className="text-muted-foreground text-xs mt-0.5">от <span className="text-neon-cyan">{topic.author}</span> · {topic.time}</div>
      </div>
      <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
        <span className="flex items-center gap-1"><Icon name="MessageSquare" size={12} />{topic.replies}</span>
        <span className="hidden sm:flex items-center gap-1"><Icon name="Eye" size={12} />{topic.views.toLocaleString()}</span>
      </div>
    </div>
  );
}

// --- AUTH MODAL ---
function AuthModal({ mode, onClose, onSwitch }: { mode: "login" | "register"; onClose: () => void; onSwitch: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md neon-border rounded-xl p-8 animate-scale-in"
        style={{ background: "hsl(220,20%,8%)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
          <Icon name="X" size={20} />
        </button>
        <div className="text-center mb-8">
          <div className="font-gaming text-2xl font-bold neon-purple mb-1">
            {mode === "login" ? "ВХОД" : "РЕГИСТРАЦИЯ"}
          </div>
          <div className="text-muted-foreground text-sm">
            {mode === "login" ? "Войди в своё игровое измерение" : "Создай свой аккаунт воина"}
          </div>
        </div>
        <div className="space-y-4">
          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Никнейм</label>
              <input className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="Твой игровой ник" />
            </div>
          )}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Email</label>
            <input type="email" className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="your@email.com" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Пароль</label>
            <input type="password" className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="••••••••" />
          </div>
          {mode === "register" && (
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Повтори пароль</label>
              <input type="password" className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="••••••••" />
            </div>
          )}
          <button className="btn-gaming w-full py-3 rounded-lg font-display tracking-widest text-sm mt-2">
            {mode === "login" ? "ВОЙТИ" : "СОЗДАТЬ АККАУНТ"}
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

// --- NEW TOPIC MODAL ---
function NewTopicModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-xl neon-border rounded-xl p-8 animate-scale-in"
        style={{ background: "hsl(220,20%,8%)" }}
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-white transition-colors">
          <Icon name="X" size={20} />
        </button>
        <div className="font-gaming text-xl font-bold neon-purple mb-6">НОВАЯ ТЕМА</div>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Заголовок</label>
            <input className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground" placeholder="Название темы..." />
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Категория</label>
            <select className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors">
              {categories.map(c => <option key={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest mb-1 block font-gaming">Текст</label>
            <textarea className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:border-neon-purple transition-colors placeholder:text-muted-foreground resize-none h-32" placeholder="Опиши свою тему..." />
          </div>
          <button className="btn-gaming w-full py-3 rounded-lg font-display tracking-widest text-sm">ОПУБЛИКОВАТЬ</button>
        </div>
      </div>
    </div>
  );
}

// --- PROFILE PAGE ---
function ProfilePage({ onClose }: { onClose: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h2 className="font-display text-2xl text-white">ПРОФИЛЬ ИГРОКА</h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="game-card rounded-xl p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-4xl mx-auto animate-float shadow-lg" style={{ boxShadow: "0 0 30px rgba(168,85,247,0.4)" }}>
                ⚡
              </div>
              <div className="absolute bottom-0 right-0 online-dot border-2 border-background rounded-full" />
            </div>
            <div className="font-display text-xl text-white mb-1">NeXus_Pro</div>
            <div className="text-muted-foreground text-sm mb-3">Присоединился: Янв 2024</div>
            <span className="badge-legendary text-white text-xs px-3 py-1 rounded-full font-gaming font-bold">ЛЕГЕНДА</span>
          </div>
          <div className="game-card rounded-xl p-5">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Статистика</div>
            <div className="space-y-3">
              {[
                { label: "Уровень", value: "87", icon: "⚡" },
                { label: "XP", value: "48 200", icon: "⭐" },
                { label: "Постов", value: "1 284", icon: "💬" },
                { label: "Лайков", value: "8 420", icon: "❤️" },
                { label: "Подписчиков", value: "342", icon: "👥" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">{s.icon} {s.label}</span>
                  <span className="font-gaming text-sm text-white">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="game-card rounded-xl p-5">
            <div className="flex justify-between mb-2">
              <span className="font-gaming text-xs text-muted-foreground">LVL 87</span>
              <span className="font-gaming text-xs text-neon-cyan">LVL 88</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div className="xp-bar h-full rounded-full" style={{ width: "72%" }} />
            </div>
            <div className="text-right mt-1 text-xs text-muted-foreground">48 200 / 50 000 XP</div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-6">
          <div className="game-card rounded-xl p-6">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Редактировать профиль</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Никнейм</label>
                <input className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm" defaultValue="NeXus_Pro" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Любимая игра</label>
                <input className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm" defaultValue="NEXUS Online" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">О себе</label>
                <textarea className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm resize-none h-20" defaultValue="Профессиональный геймер, стример и создатель гайдов." />
              </div>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <button className="btn-gaming px-6 py-2 rounded-lg text-sm font-display tracking-wider">СОХРАНИТЬ</button>
              <button className="border border-border text-muted-foreground hover:text-white px-4 py-2 rounded-lg text-sm transition-colors">Сменить аватар</button>
            </div>
          </div>
          <div className="game-card rounded-xl p-6">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Достижения</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {achievements.map((a) => (
                <div key={a.name} className="flex items-center gap-3 bg-secondary/50 rounded-lg p-3 border border-border hover:border-neon-purple/40 transition-colors">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ background: a.color + "22", border: `1px solid ${a.color}44` }}>
                    {a.icon}
                  </div>
                  <div>
                    <div className="text-white text-xs font-semibold">{a.name}</div>
                    <div className="text-muted-foreground text-xs">{a.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="game-card rounded-xl p-6">
            <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest mb-4">Последняя активность</div>
            <div className="space-y-2">
              {topics.slice(0, 4).map(t => (
                <div key={t.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{t.avatar}</span>
                    <span className="text-foreground hover:text-neon-purple cursor-pointer transition-colors line-clamp-1">{t.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{t.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- CONTACTS PAGE ---
function ContactsPage({ onClose }: { onClose: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
          <Icon name="ArrowLeft" size={20} />
        </button>
        <h2 className="font-display text-2xl text-white">КОНТАКТЫ</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        <div className="game-card rounded-xl p-6 space-y-5">
          <div className="font-gaming text-xs text-muted-foreground uppercase tracking-widest">Напиши нам</div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Имя</label>
            <input className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm placeholder:text-muted-foreground" placeholder="Твой ник" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Email</label>
            <input className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm placeholder:text-muted-foreground" placeholder="email@example.com" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Сообщение</label>
            <textarea className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-foreground focus:outline-none focus:border-neon-purple text-sm resize-none h-28 placeholder:text-muted-foreground" placeholder="Твоё сообщение..." />
          </div>
          <button className="btn-gaming w-full py-2.5 rounded-lg font-display tracking-wider text-sm">ОТПРАВИТЬ</button>
        </div>
        <div className="space-y-4">
          {[
            { icon: "Gamepad2", label: "Discord", value: "discord.gg/nexusforum", color: "#5865f2" },
            { icon: "Send", label: "Telegram", value: "@nexusforum", color: "#00f5ff" },
            { icon: "Mail", label: "Email", value: "support@nexusforum.gg", color: "#a855f7" },
            { icon: "Youtube", label: "YouTube", value: "NEXUS Forum Official", color: "#ef4444" },
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

// --- MAIN ---
export default function Index() {
  const [activePage, setActivePage] = useState("home");
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  const [newTopic, setNewTopic] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);

  const filteredTopics = searchQuery
    ? topics.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.author.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : topics;

  return (
    <div className="min-h-screen bg-background grid-bg">
      {/* Modals */}
      {authModal && (
        <AuthModal
          mode={authModal}
          onClose={() => setAuthModal(null)}
          onSwitch={() => setAuthModal(authModal === "login" ? "register" : "login")}
        />
      )}
      {newTopic && <NewTopicModal onClose={() => setNewTopic(false)} />}

      {/* NAVBAR */}
      <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl" style={{ background: "hsla(220,20%,6%,0.85)" }}>
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button onClick={() => setActivePage("home")} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-sm font-bold text-white font-gaming" style={{ boxShadow: "0 0 12px rgba(168,85,247,0.5)" }}>N</div>
            <span className="font-gaming text-base font-bold hidden sm:block" style={{ color: "#a855f7", textShadow: "0 0 10px rgba(168,85,247,0.5)" }}>NEXUS</span>
          </button>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  activePage === item.id
                    ? "bg-primary/15 text-neon-purple"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon name={item.icon} size={14} />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setNewTopic(true)} className="btn-gaming hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs">
              <Icon name="Plus" size={14} />
              <span>Тема</span>
            </button>
            <button onClick={() => setAuthModal("login")} className="hidden sm:block border border-border text-muted-foreground hover:text-white hover:border-neon-purple/40 px-4 py-2 rounded-lg text-xs font-gaming transition-all">
              ВОЙТИ
            </button>
            <button onClick={() => setAuthModal("register")} className="btn-gaming px-3 py-2 rounded-lg text-xs hidden sm:block">
              РЕГИСТРАЦИЯ
            </button>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="lg:hidden text-muted-foreground hover:text-white p-1">
              <Icon name={mobileMenu ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {mobileMenu && (
          <div className="lg:hidden border-t border-border px-4 py-3 space-y-1 animate-fade-in" style={{ background: "hsl(220,20%,7%)" }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => { setActivePage(item.id); setMobileMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                  activePage === item.id ? "bg-primary/15 text-neon-purple" : "text-muted-foreground hover:text-white"
                }`}
              >
                <Icon name={item.icon} size={16} />
                {item.label}
              </button>
            ))}
            <div className="flex gap-2 pt-2 border-t border-border">
              <button onClick={() => { setAuthModal("login"); setMobileMenu(false); }} className="flex-1 border border-border text-muted-foreground py-2 rounded-lg text-xs font-gaming">ВОЙТИ</button>
              <button onClick={() => { setAuthModal("register"); setMobileMenu(false); }} className="flex-1 btn-gaming py-2 rounded-lg text-xs">РЕГИСТРАЦИЯ</button>
            </div>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-8">

        {activePage === "profile" && <ProfilePage onClose={() => setActivePage("home")} />}
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
                <input
                  className="w-full bg-secondary border border-border rounded-xl pl-12 pr-4 py-4 text-foreground focus:outline-none focus:border-neon-purple text-base placeholder:text-muted-foreground transition-colors"
                  placeholder="Поиск тем, авторов..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="space-y-2">
              {filteredTopics.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <div className="text-4xl mb-3">🔍</div>
                  <div>Ничего не найдено</div>
                </div>
              ) : filteredTopics.map(t => <TopicRow key={t.id} topic={t} />)}
            </div>
          </div>
        )}

        {activePage === "rating" && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => setActivePage("home")} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
              <h2 className="font-display text-2xl text-white">РЕЙТИНГ ИГРОКОВ</h2>
            </div>
            <div className="max-w-2xl space-y-3">
              {topUsers.map((user, i) => (
                <div key={user.rank} className="game-card rounded-xl p-4 flex items-center gap-4 animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-gaming font-bold text-lg ${user.rank === 1 ? "text-yellow-400" : user.rank === 2 ? "text-gray-300" : user.rank === 3 ? "text-amber-600" : "text-muted-foreground"}`} style={{ background: user.rank <= 3 ? "rgba(245,158,11,0.1)" : "transparent", border: user.rank <= 3 ? "1px solid rgba(245,158,11,0.2)" : "1px solid transparent" }}>
                    {user.rank === 1 ? "👑" : user.rank === 2 ? "🥈" : user.rank === 3 ? "🥉" : user.rank}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600/40 to-cyan-500/40 flex items-center justify-center text-xl border border-border">
                    {user.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="text-xs text-muted-foreground">Уровень {user.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-gaming text-sm text-neon-cyan">{user.xp.toLocaleString()} XP</div>
                    <span className={`text-xs px-1.5 py-0.5 rounded text-white font-bold ${user.badge === "legendary" ? "badge-legendary" : user.badge === "epic" ? "badge-epic" : "badge-rare"}`}>
                      {user.badgeName.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePage === "topics" && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <button onClick={() => setActivePage("home")} className="text-muted-foreground hover:text-white"><Icon name="ArrowLeft" size={20} /></button>
                <h2 className="font-display text-2xl text-white">ВСЕ ТЕМЫ</h2>
              </div>
              <button onClick={() => setNewTopic(true)} className="btn-gaming flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
                <Icon name="Plus" size={16} /> Новая тема
              </button>
            </div>
            <div className="space-y-2">
              {topics.map((t, i) => (
                <div key={t.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.06}s` }}>
                  <TopicRow topic={t} />
                </div>
              ))}
            </div>
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
                <div key={cat.id} className="game-card rounded-xl p-5 cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 0.08}s` }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: cat.color + "22", border: `1px solid ${cat.color}44` }}>
                      <Icon name={cat.icon} size={24} style={{ color: cat.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-0.5">{cat.name}</div>
                      <div className="text-muted-foreground text-sm">{cat.desc}</div>
                    </div>
                    <div className="text-right text-sm">
                      <div className="font-gaming text-neon-purple">{cat.topics.toLocaleString()}</div>
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
            {/* Hero */}
            <section className="relative rounded-2xl overflow-hidden" style={{ minHeight: 320 }}>
              <img src={HERO_IMAGE} alt="NEXUS Forum" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="relative z-10 p-8 md:p-12 flex flex-col justify-end" style={{ minHeight: 320 }}>
                <div className="font-gaming text-xs text-neon-cyan uppercase tracking-[0.3em] mb-3">Добро пожаловать в</div>
                <h1 className="font-display text-4xl md:text-6xl text-white mb-3 glitch" style={{ textShadow: "0 0 30px rgba(168,85,247,0.5)" }}>
                  NEXUS FORUM
                </h1>
                <p className="text-muted-foreground text-base md:text-lg mb-6 max-w-lg">
                  Крупнейшее игровое сообщество. Обсуждай, делись опытом, побеждай вместе.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setAuthModal("register")} className="btn-gaming flex items-center gap-2 px-6 py-3 rounded-xl">
                    <Icon name="Zap" size={16} /> Присоединиться
                  </button>
                  <button onClick={() => setActivePage("topics")} className="border border-border text-white hover:border-neon-cyan/50 px-6 py-3 rounded-xl text-sm transition-all hover:bg-white/5">
                    Смотреть темы
                  </button>
                </div>
              </div>
            </section>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Участников", value: "84 200", icon: "👥", color: "#a855f7" },
                { label: "Тем", value: "4 251", icon: "💬", color: "#00f5ff" },
                { label: "Сообщений", value: "286K", icon: "📝", color: "#39ff14" },
                { label: "Онлайн", value: "1 340", icon: "⚡", color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className="game-card rounded-xl p-4 text-center">
                  <div className="text-2xl mb-1">{s.icon}</div>
                  <div className="font-gaming text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-muted-foreground text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Hot Topics */}
              <div className="lg:col-span-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg text-white flex items-center gap-2">
                    <span className="text-neon-orange">🔥</span> Горячие темы
                  </h2>
                  <button onClick={() => setActivePage("topics")} className="text-neon-purple text-xs hover:text-neon-cyan transition-colors font-gaming">ВСЕ ТЕМЫ →</button>
                </div>
                <div className="space-y-2">
                  {topics.slice(0, 5).map((t, i) => (
                    <div key={t.id} className="animate-fade-in" style={{ animationDelay: `${i * 0.07}s` }}>
                      <TopicRow topic={t} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-5">
                <div className="game-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-gaming text-xs text-muted-foreground uppercase tracking-widest">Топ игроки</span>
                    <button onClick={() => setActivePage("rating")} className="text-neon-purple text-xs hover:text-neon-cyan font-gaming">→ ВСЕ</button>
                  </div>
                  <div className="space-y-3">
                    {topUsers.slice(0, 3).map(u => (
                      <div key={u.rank} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/40 to-cyan-500/40 flex items-center justify-center text-base border border-border">{u.avatar}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-sm font-medium truncate">{u.name}</div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <div className="h-1 bg-secondary rounded-full flex-1 overflow-hidden">
                              <div className="xp-bar h-full" style={{ width: `${(u.xp / 50000) * 100}%` }} />
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{u.level} lvl</span>
                          </div>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded text-white font-bold ${u.badge === "legendary" ? "badge-legendary" : u.badge === "epic" ? "badge-epic" : "badge-rare"}`}>
                          {u.badgeName.slice(0, 3).toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="game-card rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-gaming text-xs text-muted-foreground uppercase tracking-widest">Категории</span>
                    <button onClick={() => setActivePage("categories")} className="text-neon-purple text-xs hover:text-neon-cyan font-gaming">→ ВСЕ</button>
                  </div>
                  <div className="space-y-2">
                    {categories.slice(0, 4).map(c => (
                      <button key={c.id} onClick={() => setActivePage("categories")} className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors text-left">
                        <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ background: c.color + "22" }}>
                          <Icon name={c.icon} size={14} style={{ color: c.color }} />
                        </div>
                        <span className="text-sm text-foreground flex-1 truncate">{c.name}</span>
                        <span className="text-xs text-muted-foreground">{c.topics}</span>
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

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8" style={{ background: "hsl(220,20%,5%)" }}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center text-xs font-gaming font-bold text-white">N</div>
            <span className="font-gaming text-sm" style={{ color: "#a855f7" }}>NEXUS FORUM</span>
          </div>
          <div className="text-muted-foreground text-xs">© 2026 NEXUS Forum. Все права защищены.</div>
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
