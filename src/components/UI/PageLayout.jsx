import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function PageLayout({ title, tabs }) {
    return (
        <div className="min-h-screen text-[#f5e5c9] p-8 pb-16 relative">
            <div className="max-w-7xl mx-auto">
                {/* Page Title */}
                <h1 className="text-center text-[#d4af37] text-4xl md:text-5xl font-serif tracking-widest mb-8 drop-shadow-[0_0_8px_rgba(212,175,55,0.6)] font-[Cinzel]">
                    {title}
                </h1>

                {/* Contextual Tabs */}
                {tabs && tabs.length > 0 && (
                    <div className="flex justify-center mb-8 border-b border-[#d4af3766]">
                        <nav className="flex gap-8">
                            {tabs.map((tab) => (
                                <NavLink
                                    key={tab.to}
                                    to={tab.to}
                                    end={tab.end}
                                    className={({ isActive }) =>
                                        `pb-4 text-lg tracking-widest uppercase transition-colors duration-200 border-b-2 ${isActive
                                            ? 'text-[#d4af37] border-[#d4af37]'
                                            : 'text-[#f5e5c999] border-transparent hover:text-[#f5e5c9] hover:border-[#f5e5c966]'
                                        }`
                                    }
                                >
                                    {tab.label}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}

                {/* Content Area */}
                <div className="relative z-10">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
