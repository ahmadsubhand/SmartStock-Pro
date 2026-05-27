import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    FolderGit2, 
    LayoutGrid, 
    Package, 
    Tags, 
    Store, 
    Truck, 
    ArrowRightLeft, 
    Repeat, 
    UploadCloud, 
    FileText, 
    Activity, 
    Users 
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';

const footerNavItems: NavItem[] = [
    {
        title: 'Panduan Sistem',
        href: '#',
        icon: BookOpen,
    },
    {
        title: 'Bantuan IT',
        href: '#',
        icon: FolderGit2,
    },
];

export function AppSidebar() {
    // 1. Ambil data user dari global props Inertia
    const { auth } = usePage().props as any;

    // 2. Fungsi Helper untuk mengecek Role
    // Asumsi: auth.user.roles berisi array nama role seperti ['admin'] atau ['manager']
    const hasAnyRole = (allowedRoles: string[]) => {
        if (!auth?.user?.roles) { 
          return false;
        }

        return allowedRoles.some(role => auth.user.roles.includes(role));
    };

    // 3. Render Menu Berdasarkan Hak Akses (RBAC)
    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: dashboard(),
            icon: LayoutGrid,
        },
        
        // --- MASTER DATA (Admin & Manager) ---
        ...(hasAnyRole(['admin', 'manager']) ? [
            { title: 'Data Produk', href: '/admin/products', icon: Package },
            { title: 'Kategori', href: '/admin/categories', icon: Tags },
            { title: 'Gudang / Cabang', href: '/admin/warehouses', icon: Store },
            { title: 'Data Supplier', href: '/admin/suppliers', icon: Truck },
        ] : []),

        // --- TRANSAKSI STOK (Admin & Staf) ---
        ...(hasAnyRole(['admin', 'staff']) ? [
            { title: 'Transaksi (In/Out)', href: '/admin/transactions', icon: ArrowRightLeft },
        ] : []),

        // --- TRANSFER GUDANG (Admin, Manager, Staf) ---
        ...(hasAnyRole(['admin', 'manager', 'staff']) ? [
            { title: 'Transfer Internal', href: '/admin/transfers', icon: Repeat },
        ] : []),

        // --- BATCH IMPORT (Hanya Admin) ---
        ...(hasAnyRole(['admin']) ? [
            { title: 'Batch Import CSV', href: '/admin/imports', icon: UploadCloud },
        ] : []),

        // --- LAPORAN / PDF (Admin, Manager, Viewer) ---
        ...(hasAnyRole(['admin', 'manager', 'viewer']) ? [
            { title: 'Pusat Laporan', href: '/admin/reports', icon: FileText },
        ] : []),

        // --- PENGATURAN SISTEM (Hanya Admin) ---
        ...(hasAnyRole(['admin']) ? [
            { title: 'Kelola Pengguna', href: '/admin/users', icon: Users },
            { title: 'System Monitor', href: '/admin/system-monitor', icon: Activity },
        ] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {/* Melempar daftar menu yang sudah difilter ke komponen NavMain */}
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}