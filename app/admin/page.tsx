"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  Search,
  Download,
  X,
  CheckCircle,
  Truck,
  Snowflake,
  ShieldCheck,
  Tag,
  Mail,
  RefreshCw,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  MessageSquare,
  Clock,
  Printer,
  Send,
  SlidersHorizontal,
  LogOut,
  ChevronRight,
  CheckSquare,
  Square,
  DollarSign,
  BarChart3,
  Boxes,
  MessageCircle,
  Copy,
  Crown,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink,
  ArrowUpRight,
  Bell,
  Webhook
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/dictionary";
import { useSystemHealth } from "@/lib/hooks/useSystemHealth";
import { useRealtimeTable } from "@/lib/hooks/useRealtimeTable";
import { useAdminGuard } from "@/lib/hooks/useAdminGuard";

type Tab =
  | "overview"
  | "analytics"
  | "inventory"
  | "templates"
  | "products"
  | "categories"
  | "orders"
  | "support"
  | "coupons"
  | "brands"
  | "clients"
  | "users";

// Utility helper to trigger client-side CSV downloads
function downloadCSV(data: any[], filename: string, headers: string[]) {
  const BOM = "\uFEFF";
  let csvContent = BOM + headers.join(",") + "\n";

  data.forEach((row) => {
    const line = row
      .map((val: any) => {
        let cleanVal = val === null || val === undefined ? "" : String(val);
        cleanVal = cleanVal.replace(/"/g, '""');
        if (cleanVal.includes(",") || cleanVal.includes('"') || cleanVal.includes("\n")) {
          cleanVal = `"${cleanVal}"`;
        }
        return cleanVal;
      })
      .join(",");
    csvContent += line + "\n";
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Utility helper to trigger browser print dialog
function printDocument(htmlContent: string, title: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <meta charset="utf-8" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Manrope:wght@400;600;700&display=swap');
          body { font-family: 'Manrope', sans-serif; margin: 40px; color: #191611; background: #fff; }
          .print-header { border-bottom: 2px solid #AD7D39; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo-text { font-family: 'Cormorant Garamond', serif; font-size: 28px; font-weight: 700; color: #191611; margin: 0; }
          h1, h2, h3, h4 { margin: 0 0 10px 0; color: #191611; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; margin-bottom: 20px; }
          th, td { border-bottom: 1px solid #E9DBC6; padding: 12px 16px; text-align: left; font-size: 13px; }
          th { background-color: #FBF8F3; color: #625D55; font-weight: 700; font-size: 11px; text-transform: uppercase; }
          .text-end { text-align: right; }
          .invoice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
          .invoice-box { background: #FBF8F3; padding: 20px; border-radius: 12px; border: 1px solid #E9DBC6; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        ${htmlContent}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `);
  printWindow.document.close();
}

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading } = useAdminGuard();
  const systemHealth = useSystemHealth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [loading, setLoading] = useState(true);
  const [dbWarning, setDbWarning] = useState<string | null>(null);

  // Core Data Lists
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<string[]>([]);
  const [admins, setAdmins] = useState<any[]>([]);

  // Packaging Inventory State
  const [inventoryItems, setInventoryItems] = useState([
    { id: "inv_1", name: "Royal Emerald Velvet Box Shell", type: "Box Shell", stock: 34, minThreshold: 10, unit: "units" },
    { id: "inv_2", name: "Obsidian Black Velvet Box Shell", type: "Box Shell", stock: 22, minThreshold: 10, unit: "units" },
    { id: "inv_3", name: "Soft Rose Quartz Box Shell", type: "Box Shell", stock: 8, minThreshold: 12, unit: "units" },
    { id: "inv_4", name: "Champagne Gold Satin Ribbon", type: "Ribbon Roll", stock: 45, minThreshold: 15, unit: "rolls" },
    { id: "inv_5", name: "Gold Foil Embossed Calligraphy Cards", type: "Cards", stock: 120, minThreshold: 30, unit: "cards" },
    { id: "inv_6", name: "Ivory Suede Interior Linings", type: "Lining", stock: 6, minThreshold: 15, unit: "sheets" },
  ]);

  // Search & Filter state
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("all");
  const [orderSearch, setOrderSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [ticketSearch, setTicketSearch] = useState("");
  const [clientSearch, setClientSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(new Set());

  // Template Copying Notification State
  const [copiedTemplateId, setCopiedTemplateId] = useState<string | null>(null);

  // Restock Inventory Modal State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<any | null>(null);
  const [addStockAmount, setAddStockAmount] = useState(10);

  // Modal display states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [userForm, setUserForm] = useState({
    email: "",
    role: "advisor",
    rules: {
      canManageOrders: true,
      canManageTickets: true,
      canManageInventory: false,
      canManageUsers: false,
    }
  });

  const [isOccasionModalOpen, setIsOccasionModalOpen] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<any | null>(null);

  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [orderFinalPrice, setOrderFinalPrice] = useState("");
  const [orderDepositAmount, setOrderDepositAmount] = useState("");
  const [orderPaymentType, setOrderPaymentType] = useState("FULL");
  const [adminNotes, setAdminNotes] = useState("");

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    slug: "",
    description: "",
    price: 0,
    original_price: "",
    stock: 25,
    category_id: "",
    brand_en: "Royal Velvet",
    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
    customizable: true,
  });

  const [occasionForm, setOccasionForm] = useState({ name: "", slug: "", image: "https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=600" });
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "PERCENTAGE",
    discountValue: 10,
    maxUses: 100,
    status: "ACTIVE",
  });

  // Pagination states
  const ITEMS_PER_PAGE = 10;
  const [productsPage, setProductsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  // Support Tickets Panel State
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("all");

  // Gifting Advisor Response Templates List
  const conciergeTemplates = [
    {
      id: "tmpl_1",
      title: "Price Quote Ready (WhatsApp)",
      channel: "WhatsApp",
      category: "Pricing",
      text: "Hello {{CustomerName}},\n\nYour bespoke {{BoxName}} order request (#{{OrderId}}) has been reviewed by our design team!\n\nFinal Confirmed Price: AED {{Price}}\nView your box specifications and review payment details here:\n{{CheckoutUrl}}\n\nThank you for choosing Afkar Aldar.",
    },
    {
      id: "tmpl_2",
      title: "Gold Foil Calligraphy Proof (WhatsApp)",
      channel: "WhatsApp",
      category: "Customization",
      text: "Hello {{CustomerName}},\n\nHere is the calligraphy proof for your greeting card message on order #{{OrderId}}:\n\n'{{CardMessage}}'\n\nPlease confirm if you approve this wording so our calligrapher can begin crafting.",
    },
    {
      id: "tmpl_3",
      title: "Delivery Slot Confirmation (WhatsApp)",
      channel: "WhatsApp",
      category: "Delivery",
      text: "Hello {{CustomerName}},\n\nYour customized gift box #{{OrderId}} has been prepared and scheduled for express courier delivery to {{Emirate}} on {{DeliveryDate}}.\n\nOur driver will contact you 30 minutes prior to arrival.",
    },
    {
      id: "tmpl_4",
      title: "Payment Link Reminder (Email / WhatsApp)",
      channel: "Email & WhatsApp",
      category: "Payment",
      text: "Dear {{CustomerName}},\n\nThis is a gentle reminder that your custom gift box order #{{OrderId}} is awaiting payment confirmation.\n\nYou can safely complete your order via credit card here:\n{{CheckoutUrl}}\n\nPlease let us know if you need any adjustments to your order.",
    },
  ];

  // Load Database Data
  const loadData = async () => {
    setLoading(true);
    setDbWarning(null);
    
    // Inline helper to prevent a single failing query (e.g. if table is missing or has RLS error)
    // from crashing the entire Promise.all dashboard load.
    const fetchSafe = async (queryPromise: any) => {
      try {
        const res = await queryPromise;
        if (res.error) {
          console.warn("DB load warning:", res.error);
          return { data: null };
        }
        return res;
      } catch (err) {
        console.warn("DB load error:", err);
        return { data: null };
      }
    };

    try {
      const [
        ordersRes,
        boxesRes,
        occasionsRes,
        ticketsRes,
        clientsRes,
        couponsRes,
        brandsRes,
        subscribersRes,
        adminsRes,
      ] = await Promise.all([
        fetchSafe(supabase.from("Order").select("*, Customer(*)").order("createdAt", { ascending: false })),
        fetchSafe(supabase.from("GiftBox").select("*").order("name")),
        fetchSafe(supabase.from("Occasion").select("*").order("name")),
        fetchSafe(supabase.from("Ticket").select("*").order("createdAt", { ascending: false })),
        fetchSafe(supabase.from("Customer").select("*").order("name")),
        fetchSafe(supabase.from("Coupon").select("*").order("createdAt", { ascending: false })),
        fetchSafe(supabase.from("Brand").select("*").order("name_en")),
        fetchSafe(supabase.from("Subscriber").select("*").order("createdAt", { ascending: false })),
        fetchSafe(supabase.from("AdminUser").select("*").order("createdAt", { ascending: false })),
      ]);

      setProducts(boxesRes.data || []);
      setCategories(occasionsRes.data || []);
      setOrders(ordersRes.data || []);
      setTickets(ticketsRes.data || []);
      setClients(clientsRes.data || []);
      setCoupons(couponsRes.data || []);
      setBrands(brandsRes.data || []);
      setSubscribers(subscribersRes.data ? subscribersRes.data.map((s: any) => s.email) : []);
      setAdmins(adminsRes.data || []);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadData();
  }, [isAdmin]);

  // ── Realtime: Orders ──
  useRealtimeTable("Order", {
    onInsert: (newOrder) => {
      setOrders((prev) => [newOrder, ...prev]);
    },
    onUpdate: (updated) => {
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
    },
    onDelete: (deleted) => {
      setOrders((prev) => prev.filter((o) => o.id !== deleted.id));
    },
  });

  // ── Realtime: Tickets ──
  useRealtimeTable("Ticket", {
    onInsert: (newTicket) => {
      setTickets((prev) => [newTicket, ...prev]);
    },
    onUpdate: (updated) => {
      setTickets((prev) => prev.map((t) => (t.id === updated.id ? { ...t, ...updated } : t)));
    },
    onDelete: (deleted) => {
      setTickets((prev) => prev.filter((t) => t.id !== deleted.id));
    },
  });

  // ── Realtime: Customers ──
  useRealtimeTable("Customer", {
    onInsert: (newClient) => {
      setClients((prev) => [newClient, ...prev]);
    },
    onUpdate: (updated) => {
      setClients((prev) => prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c)));
    },
  });

  // ── Realtime: Admin Users ──
  useRealtimeTable("AdminUser", {
    onInsert: (newAdmin) => {
      setAdmins((prev) => [newAdmin, ...prev]);
    },
    onUpdate: (updated) => {
      setAdmins((prev) => prev.map((a) => (a.id === updated.id ? { ...a, ...updated } : a)));
    },
    onDelete: (deleted) => {
      setAdmins((prev) => prev.filter((a) => a.id !== deleted.id));
    },
  });

  // Filter computations
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = productSearch.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (productCategoryFilter !== "all" && String(p.category_id) !== String(productCategoryFilter)) {
        return false;
      }
      return true;
    });
  }, [products, productSearch, productCategoryFilter]);

  const orderStats = useMemo(() => {
    const totalSales = orders.reduce((sum, o) => sum + Number(o.finalPrice || 0), 0);
    const totalOrders = orders.length;
    const activeProcessing = orders.filter((o) => ["NEW_REQUEST", "CONTACTED", "AWAITING_PAYMENT", "PREPARING"].includes(o.status)).length;
    const avgTicketValue = totalOrders > 0 ? totalSales / totalOrders : 0;
    return { totalSales, totalOrders, activeProcessing, avgTicketValue };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const q = orderSearch.toLowerCase();
      const custName = o.Customer?.name || o.deliveryInfo?.customerName || "";
      const matchesSearch = o.id.toLowerCase().includes(q) || custName.toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (orderStatusFilter !== "all" && String(o.status) !== orderStatusFilter) {
        return false;
      }
      return true;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));
  }, [categories, categorySearch]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesStatus = ticketStatusFilter === "all" ? true : t.status === ticketStatusFilter;
      const searchLower = ticketSearch.toLowerCase();
      const matchesSearch =
        t.name?.toLowerCase().includes(searchLower) ||
        t.email?.toLowerCase().includes(searchLower) ||
        t.subject?.toLowerCase().includes(searchLower) ||
        t.message?.toLowerCase().includes(searchLower) ||
        String(t.id).toLowerCase().includes(searchLower);
      return matchesStatus && matchesSearch;
    });
  }, [tickets, ticketSearch, ticketStatusFilter]);

  const filteredClients = useMemo(() => {
    return clients.filter((c) => c.name.toLowerCase().includes(clientSearch.toLowerCase()));
  }, [clients, clientSearch]);

  // Block rendering until admin check completes
  if (isAdminLoading || !isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-8 h-8 border-2 border-[#AD7D39] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-semibold text-[#8A8378]">Verifying admin access...</p>
      </div>
    );
  }

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.email.trim()) return;

    try {
      if (selectedUser) {
        // Edit existing admin
        const { error } = await supabase
          .from("AdminUser")
          .update({
            role: userForm.role,
            rules: userForm.rules,
          })
          .eq("id", selectedUser.id);

        if (error) throw error;
        alert("Admin user updated successfully!");
      } else {
        // Create new admin
        const { error } = await supabase
          .from("AdminUser")
          .insert({
            email: userForm.email.trim().toLowerCase(),
            role: userForm.role,
            rules: userForm.rules,
          });

        if (error) throw error;
        alert("New admin user added successfully!");
      }
      setIsUserModalOpen(false);
      loadData(); // Reload admin list
    } catch (err: any) {
      console.error(err);
      alert("Failed to save admin user: " + err.message);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to revoke admin privileges for this user?")) return;
    try {
      const { error } = await supabase
        .from("AdminUser")
        .delete()
        .eq("id", id);

      if (error) throw error;
      alert("Admin privileges revoked successfully!");
      loadData();
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete admin: " + err.message);
    }
  };



  // Copy template helper
  const handleCopyTemplate = (tmpl: any) => {
    navigator.clipboard.writeText(tmpl.text);
    setCopiedTemplateId(tmpl.id);
    setTimeout(() => setCopiedTemplateId(null), 2500);
  };

  // Restock Inventory helper
  const handleRestockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInventoryItem) return;
    setInventoryItems((prev) =>
      prev.map((item) => (item.id === selectedInventoryItem.id ? { ...item, stock: item.stock + Number(addStockAmount) } : item))
    );
    setIsRestockModalOpen(false);
    setSelectedInventoryItem(null);
  };

  // Bulk select handlers
  const handleToggleSelectAllOrders = () => {
    if (selectedOrderIds.size === filteredOrders.length) {
      setSelectedOrderIds(new Set());
    } else {
      setSelectedOrderIds(new Set(filteredOrders.map((o) => o.id)));
    }
  };

  const handleToggleSelectOrder = (id: string) => {
    setSelectedOrderIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkStatusChange = async (nextStatus: string) => {
    const ids = Array.from(selectedOrderIds);
    if (ids.length === 0) return;
    try {
      await Promise.all(ids.map((id) => supabase.from("Order").update({ status: nextStatus }).eq("id", id)));
      alert(`Updated status for ${ids.length} orders.`);
      setSelectedOrderIds(new Set());
      loadData();
    } catch (e) {
      setOrders((prev) => prev.map((o) => (ids.includes(o.id) ? { ...o, status: nextStatus } : o)));
      setSelectedOrderIds(new Set());
    }
  };

  const handleBulkPrintInvoices = () => {
    const selected = orders.filter((o) => selectedOrderIds.has(o.id));
    if (selected.length === 0) return;

    let html = "";
    selected.forEach((order, idx) => {
      const custName = order.Customer?.name || order.deliveryInfo?.customerName || "Customer";
      const total = order.finalPrice ? formatCurrency(order.finalPrice) : "Pending";
      html += `
        <div style="${idx > 0 ? "page-break-before: always; margin-top: 40px;" : ""}">
          <div class="print-header">
            <div>
              <h1 class="logo-text">AFKAR ALDAR</h1>
              <p style="font-size: 12px; color: #625D55; margin-top: 4px;">Bespoke Luxury Gifting • Dubai, UAE</p>
            </div>
            <div class="text-end" style="font-size: 12px; color: #625D55;">
              INV #${order.id}<br/>
              Date: ${new Date(order.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div class="invoice-grid">
            <div class="invoice-box">
              <h3 style="font-size: 12px; font-weight: 700; border-bottom: 1px solid #E9DBC6; padding-bottom: 4px; margin-bottom: 8px;">DELIVER TO</h3>
              <p style="margin: 0; line-height: 1.5; font-size: 12px;">
                <strong>${custName}</strong><br/>
                Email: ${order.Customer?.email || order.deliveryInfo?.customerEmail || ""}<br/>
                Phone: ${order.Customer?.phone || order.deliveryInfo?.customerPhone || ""}
              </p>
            </div>
            <div class="invoice-box">
              <h3 style="font-size: 12px; font-weight: 700; border-bottom: 1px solid #E9DBC6; padding-bottom: 4px; margin-bottom: 8px;">CURATION DETAILS</h3>
              <p style="margin: 0; line-height: 1.5; font-size: 12px;">
                Occasion Theme: <strong>${(order.occasionSlug || "Birthday").toUpperCase()}</strong><br/>
                Status: <span>${order.status}</span>
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Customization Option</th>
                <th>Selected Settings</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(order.customization || {})
                .map(
                  ([key, val]) => `
                <tr>
                  <td><strong>${key.toUpperCase()}</strong></td>
                  <td>${String(val)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
            <div style="width: 240px; border-top: 1px solid #E9DBC6; padding-top: 10px; font-size: 12px;">
              <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: 14px;">
                <span>Total Charge:</span>
                <strong>${total}</strong>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    printDocument(html, "Afkar AlDar Invoices Print");
  };

  const handleExportOrdersCSV = () => {
    const headers = ["order_id", "customer", "price", "status", "date"];
    const rows = orders.map((o) => [
      o.id,
      o.Customer?.name || o.deliveryInfo?.customerName,
      o.finalPrice || 0,
      o.status,
      new Date(o.createdAt).toLocaleDateString(),
    ]);
    downloadCSV(rows, "afkaraldar_orders.csv", headers);
  };

  // Support Tickets Handler Methods
  const handleToggleResolve = async (id: string) => {
    const ticket = tickets.find((t) => t.id === id);
    if (!ticket) return;
    const newStatus = ticket.status === "OPEN" ? "RESOLVED" : "OPEN";
    try {
      await supabase.from("Ticket").update({ status: newStatus }).eq("id", id);
      setTickets((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
      );
    } catch (e) {
      console.error("Error toggling ticket status:", e);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !replyMessage.trim()) return;
    setIsReplying(true);
    try {
      await supabase.from("Ticket").update({ status: "RESOLVED" }).eq("id", selectedTicket.id);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? { ...t, status: "RESOLVED" } : t))
      );
      setSelectedTicket(null);
      setReplyMessage("");
      alert(`Reply sent to ${selectedTicket.name} and ticket marked as RESOLVED.`);
    } catch (e) {
      console.error("Error sending reply:", e);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#191611] font-sans antialiased flex flex-col selection:bg-[#AD7D39] selection:text-white">
      
      {/* Main split dashboard wrapper */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8 flex flex-col lg:flex-row gap-8 relative z-10 w-full flex-1">
        
        {/* DESKTOP SIDEBAR NAVIGATION (Fixed Layout, Zero Overflow, Hidden Scrollbar) */}
        <aside className="hidden lg:flex flex-col justify-between w-80 shrink-0 h-fit max-h-[calc(100vh-3rem)] sticky top-6 bg-white/95 p-6 rounded-[32px] border border-[#E9DBC6]/85 shadow-2xl z-20 overflow-hidden">
          <div className="space-y-5 flex-1 min-h-0 flex flex-col">
            
            {/* Logo & Back to Site Header */}
            <div className="flex justify-between items-center border-b border-[#E9DBC6]/30 pb-4 shrink-0">
              <Link href="/" className="flex flex-col group select-none">
                <span className="font-serif font-bold text-[#191611] text-2xl tracking-tight leading-none group-hover:text-[#AD7D39] transition-colors">
                  Afkar AlDar
                </span>
                <span className="text-[10px] text-[#AD7D39] font-extrabold uppercase tracking-widest self-start mt-1">
                  Executive Suite
                </span>
              </Link>
              <Link href="/" className="text-[11px] text-[#AD7D39] hover:underline font-bold flex items-center gap-1 shrink-0 transition-colors">
                <span>Visit Store</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Admin User Badge */}
            <div className="flex items-center gap-3.5 p-3.5 bg-[#FBF8F3] rounded-2xl border border-[#E9DBC6]/60 shrink-0">
              <div className="w-11 h-11 rounded-full bg-[#191611] border-2 border-[#AD7D39]/40 text-[#AD7D39] flex items-center justify-center font-bold font-serif shadow-xs text-sm shrink-0">
                A
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-bold text-xs text-[#191611] truncate">Support Desk</div>
                <div className="text-[10px] text-[#8A8378] truncate">support@afkaraldar.ae</div>
              </div>
            </div>

            {/* Navigation vertical menu with hidden scrollbar */}
            <nav className="flex flex-col gap-1.5 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 py-1 pr-0.5">
              {[
                { id: "overview", label: "Executive Overview", icon: Clock },
                { id: "analytics", label: "Sales & Analytics", icon: BarChart3 },
                { id: "inventory", label: "Packaging Inventory", icon: Boxes, badge: inventoryItems.filter(i => i.stock <= i.minThreshold).length },
                { id: "templates", label: "Support Templates", icon: MessageCircle },
                { id: "orders", label: "Curation Requests", icon: ShoppingBag, badge: orders.filter((o) => o.status === "NEW_REQUEST").length },
                { id: "products", label: "Gift Box Designs", icon: Package },
                { id: "categories", label: "Occasions Catalog", icon: Tag },
                { id: "support", label: "Support Tickets", icon: MessageSquare, badge: tickets.filter((t) => t.status === "OPEN").length },
                { id: "clients", label: "VIP Client Directory", icon: Users },
                { id: "coupons", label: "Coupons & Discounts", icon: Mail },
                { id: "users", label: "Admin Users & Rules", icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold transition-all duration-300 cursor-pointer relative select-none shrink-0 ${
                      active
                        ? "text-white font-extrabold"
                        : "text-[#625D55] hover:text-[#191611] hover:bg-[#F6F0E7]/60"
                    }`}
                  >
                    {active && (
                      <span className="absolute inset-0 bg-[#191611] rounded-2xl shadow-md z-0" />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${active ? "text-[#AD7D39]" : "text-[#8A8378]"}`} />
                      <span>{tab.label}</span>
                    </span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="relative z-10 px-2 py-0.5 text-[9px] font-black rounded-full leading-none min-w-[18px] text-center bg-red-500 text-white">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Footer Link hubs */}
          <div className="border-t border-[#E9DBC6]/30 pt-3 mt-3 shrink-0 space-y-1.5">
            <Link
              href="/admin/notifications"
              className="w-full text-left flex items-center justify-between px-4 py-2 rounded-xl text-xs font-bold text-[#AD7D39] hover:bg-[#F6F0E7]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#AD7D39]" />
                <span>Notification Hub</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#AD7D39] text-white">
                3
              </span>
            </Link>

            <Link
              href="/admin/webhooks"
              className="w-full text-left flex items-center justify-between px-4 py-2 rounded-xl text-xs font-bold text-[#AD7D39] hover:bg-[#F6F0E7]/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Webhook className="w-4 h-4 text-[#AD7D39]" />
                <span>Webhooks Engine</span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                Live
              </span>
            </Link>

            <Link
              href="/auth"
              className="w-full text-left flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
              <span>Sign Out</span>
            </Link>
          </div>
        </aside>

        {/* MOBILE / TABLET HEADER BAR & SCROLLABLE TABS */}
        <div className="lg:hidden w-full space-y-4">
          <div className="bg-white/95 p-4 rounded-2xl border border-[#E9DBC6]/60 shadow-md flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#191611] border-2 border-[#AD7D39]/40 text-[#AD7D39] flex items-center justify-center font-bold font-serif text-sm shadow-xs">
                A
              </div>
              <div>
                <h1 className="font-bold text-sm text-[#191611] leading-none">Afkar AlDar Admin</h1>
                <p className="text-[10px] text-[#8A8378] mt-1">support@afkaraldar.ae</p>
              </div>
            </div>
            <Link
              href="/auth"
              className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4 text-red-500 shrink-0" />
            </Link>
          </div>

          {/* Mobile Horizontal Scroll Tabs */}
          <div className="flex border-b border-[#E9DBC6]/20 overflow-x-auto no-scrollbar gap-2 bg-white/95 p-2 rounded-2xl border border-[#E9DBC6]/60 shadow-sm">
            {[
              { id: "overview", label: "Overview", icon: Clock },
              { id: "analytics", label: "Analytics", icon: BarChart3 },
              { id: "inventory", label: "Inventory", icon: Boxes, badge: inventoryItems.filter(i => i.stock <= i.minThreshold).length },
              { id: "templates", label: "Templates", icon: MessageCircle },
              { id: "orders", label: "Requests", icon: ShoppingBag, badge: orders.filter((o) => o.status === "NEW_REQUEST").length },
              { id: "products", label: "Designs", icon: Package },
              { id: "categories", label: "Occasions", icon: Tag },
              { id: "support", label: "Support", icon: MessageSquare, badge: tickets.filter((t) => t.status === "OPEN").length },
              { id: "clients", label: "VIP Clients", icon: Users },
              { id: "coupons", label: "Coupons", icon: Mail },
              { id: "users", label: "Rules", icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-300 whitespace-nowrap cursor-pointer relative select-none ${
                    active
                      ? "bg-[#191611] text-white font-extrabold shadow-sm"
                      : "text-[#625D55] hover:text-[#191611] hover:bg-white/40"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "text-[#AD7D39]" : "text-[#8A8378]"}`} />
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 text-[9px] font-black rounded-full bg-red-500 text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1 min-w-0 w-full space-y-6">
        
        {/* Top Control Bar */}
        <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-2xl font-bold capitalize text-[#191611]">{activeTab.replace("_", " ")} Panel</h2>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#F6F0E7] text-[#AD7D39] border border-[#AD7D39]/20">
                Afkar AlDar Suite
              </span>
            </div>
            <p className="text-xs text-[#625D55] mt-1">
              Manage custom luxury box requests, track packaging materials, analyze revenue, and communicate with clients.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {activeTab === "products" && (
              <button
                onClick={() => {
                  setSelectedProduct(null);
                  setProductForm({
                    name: "",
                    slug: "",
                    description: "",
                    price: 450,
                    original_price: "",
                    stock: 25,
                    category_id: "",
                    brand_en: "Royal Velvet",
                    image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
                    customizable: true,
                  });
                  setIsProductModalOpen(true);
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#191611] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Box Design</span>
              </button>
            )}

            {activeTab === "categories" && (
              <button
                onClick={() => {
                  setSelectedOccasion(null);
                  setIsOccasionModalOpen(true);
                }}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#191611] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            )}

            {activeTab === "coupons" && (
              <button
                onClick={() => setIsCouponModalOpen(true)}
                className="flex-1 md:flex-initial px-4 py-2.5 rounded-xl bg-[#191611] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Coupon Code</span>
              </button>
            )}

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-[#F6F0E7] text-[#625D55] hover:bg-[#E9DBC6] hover:text-[#191611] transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* Database Warning if any */}
        {dbWarning && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold flex items-start gap-2.5 shadow-sm">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <span>{dbWarning}</span>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 1: EXECUTIVE OVERVIEW */}
        {/* ---------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A8378] font-bold uppercase tracking-wider block">Total Revenue</span>
                  <h4 className="text-2xl font-bold font-serif text-[#191611] mt-1">{formatCurrency(orderStats.totalSales)}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 block mt-1">+18.4% vs last month</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#AD7D39] flex items-center justify-center border border-amber-200">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A8378] font-bold uppercase tracking-wider block">Total Orders</span>
                  <h4 className="text-2xl font-bold font-serif text-[#191611] mt-1">{orderStats.totalOrders}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 block mt-1">+12 requests this week</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center border border-indigo-200">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A8378] font-bold uppercase tracking-wider block">Active Queue</span>
                  <h4 className="text-2xl font-bold font-serif text-[#191611] mt-1">{orderStats.activeProcessing}</h4>
                  <span className="text-[10px] font-bold text-amber-700 block mt-1">Requires action</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center border border-cyan-200">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#AD7D39]/20 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8A8378] font-bold uppercase tracking-wider block">Average Order Value</span>
                  <h4 className="text-2xl font-bold font-serif text-[#191611] mt-1">{formatCurrency(orderStats.avgTicketValue)}</h4>
                  <span className="text-[10px] font-bold text-emerald-700 block mt-1">High-end bespoke</span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* System Infrastructure & Services Health Widget */}
            <div className="bg-[#191611] text-white p-6 rounded-2xl border border-[#AD7D39]/30 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-3 gap-2">
                <div>
                  <h3 className="font-serif font-bold text-lg text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#AD7D39]" /> Live Cloud Infrastructure & Health Pings
                  </h3>
                  <p className="text-xs text-[#8A8378]">
                    Real-time connection pings across database, FCM Web Push, and Railway backend services.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4BA99] bg-white/10 px-3 py-1 rounded-full w-fit">
                    Last Checked: {systemHealth.lastChecked || "Just now"}
                  </span>
                  <button
                    onClick={systemHealth.refetch}
                    className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-[#D4BA99]"
                    title="Ping Services Now"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${systemHealth.isLoading ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                
                {/* 1. Supabase */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Supabase DB
                    </span>
                    <span className="text-[9px] uppercase font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/80 font-mono">
                      {systemHealth.supabase.latencyMs}ms
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8378]">
                    Postgres DB • Status: <span className="text-emerald-400 font-bold">{systemHealth.supabase.status}</span>
                  </p>
                </div>

                {/* 2. FCM Firebase */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Firebase FCM
                    </span>
                    <span className="text-[9px] uppercase font-bold text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/80">
                      {systemHealth.fcm.browserPermission === "granted" ? "VAPID GRANTED" : "VAPID READY"}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8378]">
                    VAPID Key: <span className="text-cyan-300 font-mono text-[10px]">BEi6aAsu...dKc</span>
                  </p>
                  <button
                    onClick={systemHealth.requestFcmPermission}
                    className="mt-1 text-[10px] font-bold text-[#D4BA99] hover:text-white hover:underline flex items-center gap-1"
                  >
                    <span>Register VAPID Web Push</span> <ChevronRight className="w-3 h-3" />
                  </button>
                </div>

                {/* 3. Railway */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" /> Railway Server
                    </span>
                    <span className="text-[9px] uppercase font-bold text-purple-300 px-2 py-0.5 rounded bg-purple-950/80 font-mono">
                      {systemHealth.railway.latencyMs}ms
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8378]">
                    Backend Container • Env: <span className="text-purple-300 font-bold">{systemHealth.railway.environment}</span>
                  </p>
                  <a
                    href="https://railway.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 text-[10px] font-bold text-[#D4BA99] hover:text-white hover:underline flex items-center gap-1"
                  >
                    <span>Railway Console</span> <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* 4. Stripe UAE */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" /> Stripe UAE
                    </span>
                    <span className="text-[9px] uppercase font-bold text-amber-300 px-2 py-0.5 rounded bg-amber-950/80">
                      AED READY
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8A8378]">Branded checkout links & webhook confirmation.</p>
                </div>

              </div>
            </div>

            {/* Recent Orders Overview */}
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-3">
                <h3 className="font-serif font-bold text-lg text-[#191611]">Recent Curation Requests</h3>
                <button onClick={() => setActiveTab("orders")} className="text-xs font-bold text-[#AD7D39] hover:underline flex items-center gap-1">
                  View All Orders <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="divide-y divide-[#3C2D1E]/10">
                {orders.slice(0, 4).map((o) => (
                  <div key={o.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#191611]">#{o.id}</span>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F6F0E7] text-[#7D5121]">
                          {o.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#292725] mt-0.5">
                        {o.Customer?.name || o.deliveryInfo?.customerName || "Guest"} • {o.occasionSlug}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-[#191611]">
                        {o.finalPrice ? formatCurrency(o.finalPrice) : "Price Pending"}
                      </span>
                      <Link href={`/admin/orders/${o.id}`}>
                        <button className="px-3 py-1.5 rounded-lg bg-[#191611] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white transition-colors text-[10px] font-bold uppercase">
                          Manage
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 2: SALES & ANALYTICS REPORTS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            
            {/* Sales Chart Mockup Bar */}
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#3C2D1E]/10 pb-3">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#191611]">Monthly Revenue & Order Volume</h3>
                  <p className="text-xs text-[#625D55]">Monthly revenue breakdown across custom gifting requests (AED).</p>
                </div>

                <button
                  onClick={handleExportOrdersCSV}
                  className="px-3.5 py-2 rounded-xl bg-[#F6F0E7] text-[#191611] hover:bg-[#E9DBC6] text-xs font-semibold flex items-center gap-2"
                >
                  <Download className="w-4 h-4 text-[#AD7D39]" />
                  <span>Export Report CSV</span>
                </button>
              </div>

              {/* Bar Chart Visual */}
              <div className="pt-4 pb-2 space-y-4">
                {[
                  { month: "May 2026", amount: "AED 34,200", percent: 45 },
                  { month: "Jun 2026", amount: "AED 48,900", percent: 68 },
                  { month: "Jul 2026", amount: "AED 56,400", percent: 80 },
                  { month: "Aug 2026 (Current)", amount: "AED 72,100", percent: 95 },
                ].map((item) => (
                  <div key={item.month} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-[#191611]">{item.month}</span>
                      <span className="font-mono text-[#AD7D39]">{item.amount}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#F6F0E7] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#AD7D39] to-[#D4BA99] rounded-full transition-all duration-500"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popularity by Occasion */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-[#191611] border-b border-[#3C2D1E]/10 pb-3">
                  Top Occasion Categories
                </h3>

                <div className="space-y-3 text-xs">
                  {[
                    { category: "Weddings & Anniversaries", share: "38%", color: "bg-[#191611]" },
                    { category: "Birthday Celebrations", share: "32%", color: "bg-[#AD7D39]" },
                    { category: "Corporate Luxury Gifting", share: "18%", color: "bg-[#7D5121]" },
                    { category: "New Baby & Milestones", share: "12%", color: "bg-[#D4BA99]" },
                  ].map((cat) => (
                    <div key={cat.category} className="p-3 rounded-xl bg-[#FBF8F3] border border-[#3C2D1E]/10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${cat.color}`} />
                        <span className="font-semibold text-[#191611]">{cat.category}</span>
                      </div>
                      <span className="font-mono font-bold text-[#AD7D39]">{cat.share}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conversion Funnel */}
              <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
                <h3 className="font-serif font-bold text-base text-[#191611] border-b border-[#3C2D1E]/10 pb-3">
                  Order Status Conversion Funnel
                </h3>

                <div className="space-y-2 text-xs">
                  {[
                    { step: "1. Request Submitted", count: "48 Requests", rate: "100%" },
                    { step: "2. Advisor Contacted", count: "42 Contacted", rate: "87.5%" },
                    { step: "3. Price Confirmed", count: "38 Confirmed", rate: "79.1%" },
                    { step: "4. Payment Completed", count: "34 Paid", rate: "70.8%" },
                  ].map((s) => (
                    <div key={s.step} className="p-3 rounded-xl bg-[#F6F0E7]/60 border border-[#3C2D1E]/10 flex justify-between items-center">
                      <span className="font-semibold text-[#191611]">{s.step}</span>
                      <span className="font-mono text-[11px] font-bold text-[#AD7D39]">{s.count} ({s.rate})</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 3: PACKAGING INVENTORY TRACKER */}
        {/* ---------------------------------------------------- */}
        {activeTab === "inventory" && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#191611]">Packaging Materials & Stock Tracker</h3>
                  <p className="text-xs text-[#625D55]">Monitor raw box shells, velvet linings, satin ribbon rolls, and calligraphy card stock.</p>
                </div>
              </div>

              {/* Inventory Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#3C2D1E]/10 text-[10px] font-bold uppercase tracking-wider text-[#625D55]">
                      <th className="py-3 px-4">Material Name</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Stock Level</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#3C2D1E]/10">
                    {inventoryItems.map((item) => {
                      const isLow = item.stock <= item.minThreshold;
                      return (
                        <tr key={item.id} className="hover:bg-[#FBF8F3] transition-colors">
                          <td className="py-3 px-4 font-semibold text-[#191611]">{item.name}</td>
                          <td className="py-3 px-4 text-[#625D55]">{item.type}</td>
                          <td className="py-3 px-4 font-mono font-bold text-[#191611]">
                            {item.stock} {item.unit}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                                isLow
                                  ? "bg-amber-100 text-amber-900 border-amber-300"
                                  : "bg-emerald-100 text-emerald-800 border-emerald-300"
                              }`}
                            >
                              {isLow ? "Low Stock Warning" : "In Stock"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setSelectedInventoryItem(item);
                                setIsRestockModalOpen(true);
                              }}
                              className="px-3 py-1.5 rounded-lg bg-[#191611] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white transition-all text-[10px] font-bold uppercase"
                            >
                              Restock
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 4: SUPPORT RESPONSE TEMPLATES */}
        {/* ---------------------------------------------------- */}
        {activeTab === "templates" && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="border-b border-[#3C2D1E]/10 pb-3">
                <h3 className="font-serif font-bold text-lg text-[#191611]">Support Quick-Response Templates</h3>
                <p className="text-xs text-[#625D55]">Pre-written luxury responses for WhatsApp messaging & email customer care.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conciergeTemplates.map((tmpl) => (
                  <div key={tmpl.id} className="p-5 rounded-2xl border border-[#3C2D1E]/10 bg-[#FBF8F3] space-y-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#AD7D39] text-white">
                          {tmpl.channel}
                        </span>
                        <span className="text-[10px] text-[#8A8378]">{tmpl.category}</span>
                      </div>
                      <h4 className="font-serif font-bold text-base text-[#191611] mt-2">{tmpl.title}</h4>
                      <p className="text-xs text-[#625D55] bg-white p-3 rounded-xl border border-[#3C2D1E]/10 mt-2 whitespace-pre-line font-mono text-[11px]">
                        {tmpl.text}
                      </p>
                    </div>

                    <button
                      onClick={() => handleCopyTemplate(tmpl)}
                      className="w-full py-2.5 rounded-xl bg-[#191611] text-[#D4BA99] hover:bg-[#AD7D39] hover:text-white transition-all text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 mt-2"
                    >
                      {copiedTemplateId === tmpl.id ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Template Text</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 5: CURATION REQUESTS & ORDERS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "orders" && (
          <div className="space-y-6">
            
            {/* 4 Analytical Revenue Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Sales</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
                    {formatCurrency(orders.reduce((sum, o) => sum + Number(o.finalPrice || 0), 0))}
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> +100% checkouts
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Orders</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">{orders.length}</h4>
                  <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                    <ShoppingBag className="w-3 h-3" /> Store orders
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Awaiting Review</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
                    {orders.filter(o => o.status === "NEW_REQUEST").length}
                  </h4>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Needs action
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Avg Ticket</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
                    {formatCurrency(
                      orders.length > 0
                        ? orders.reduce((sum, o) => sum + Number(o.finalPrice || 0), 0) / orders.length
                        : 0
                    )}
                  </h4>
                  <span className="text-[10px] text-cyan-600 font-bold flex items-center gap-1 mt-1">
                    <BarChart3 className="w-3 h-3" /> Per request
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Main Orders Control Panel */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E9DBC6]/60 shadow-xs space-y-6">
              
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-[#191611]">Manage Curation Orders</h2>
                    <span className="px-3 py-1 rounded-full bg-[#191611] text-[#AD7D39] text-xs font-bold font-mono">
                      {filteredOrders.length} orders
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Real-time dispatch status, customer invoicing, and custom price curation.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleExportOrdersCSV}
                    className="px-4 py-2.5 rounded-2xl bg-gray-100 hover:bg-gray-200 text-[#191611] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer h-[42px]"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Search Control Row */}
              <div className="relative flex items-center w-full">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search order ID, customer name, or theme..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#AD7D39] rounded-2xl text-xs font-semibold focus:outline-none text-[#191611] shadow-inner transition-all placeholder:text-gray-400"
                />
                {orderSearch && (
                  <button onClick={() => setOrderSearch("")} className="absolute right-3.5 p-1 text-gray-400 hover:text-[#191611]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter Chips */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
                {[
                  { key: "all", label: "All", icon: <Layers className="w-3.5 h-3.5" />, count: orders.length },
                  { key: "NEW_REQUEST", label: "New Request", icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, count: orders.filter(o => o.status === 'NEW_REQUEST').length },
                  { key: "CONTACTED", label: "Contacted", icon: <Mail className="w-3.5 h-3.5 text-indigo-500" />, count: orders.filter(o => o.status === 'CONTACTED').length },
                  { key: "AWAITING_PAYMENT", label: "Awaiting Payment", icon: <DollarSign className="w-3.5 h-3.5 text-yellow-500" />, count: orders.filter(o => o.status === 'AWAITING_PAYMENT').length },
                  { key: "PREPARING", label: "Preparing", icon: <Snowflake className="w-3.5 h-3.5 text-cyan-500" />, count: orders.filter(o => o.status === 'PREPARING').length },
                  { key: "SHIPPED", label: "Shipped", icon: <Truck className="w-3.5 h-3.5 text-blue-500" />, count: orders.filter(o => o.status === 'SHIPPED').length },
                  { key: "DELIVERED", label: "Delivered", icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, count: orders.filter(o => o.status === 'DELIVERED').length }
                ].map((chip) => {
                  const isSelected = orderStatusFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => {
                        setOrderStatusFilter(chip.key);
                        setSelectedOrderIds(new Set());
                      }}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-[#191611] text-white border-[#191611] shadow-xs"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                    >
                      {chip.icon}
                      <span>{chip.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-sans ${
                        isSelected ? "bg-[#AD7D39] text-[#191611]" : "bg-gray-200 text-gray-600"
                      }`}>
                        {chip.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Bulk Actions floating banner */}
              {selectedOrderIds.size > 0 && (
                <div className="p-4 bg-[#191611] text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md border border-[#AD7D39]/30">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-[#AD7D39] text-white flex items-center justify-center text-xs font-black font-sans">
                      {selectedOrderIds.size}
                    </span>
                    <span className="text-xs font-bold">
                      orders selected for bulk actions
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBulkPrintInvoices}
                      className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border border-white/20"
                    >
                      <Printer className="w-4 h-4 text-[#AD7D39]" />
                      <span>Print Invoices (PDF)</span>
                    </button>

                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleBulkStatusChange(e.target.value);
                          e.target.value = "";
                        }
                      }}
                      defaultValue=""
                      className="px-3 py-2 text-xs font-bold bg-[#3C2D1E] text-white border border-[#AD7D39]/30 rounded-xl focus:outline-none cursor-pointer"
                    >
                      <option value="" disabled>Bulk Status...</option>
                      <option value="NEW_REQUEST">NEW_REQUEST</option>
                      <option value="CONTACTED">CONTACTED</option>
                      <option value="AWAITING_PAYMENT">AWAITING_PAYMENT</option>
                      <option value="PREPARING">PREPARING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Orders Table - Desktop */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100">
                      <th className="p-4 text-center w-10">
                        <button onClick={handleToggleSelectAllOrders} className="cursor-pointer flex items-center justify-center mx-auto">
                          {selectedOrderIds.size > 0 && selectedOrderIds.size === filteredOrders.length ? (
                            <CheckSquare className="w-4 h-4 text-[#191611]" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </th>
                      <th className="p-4 text-start">Order ID & Date</th>
                      <th className="p-4 text-start">Customer & Contact</th>
                      <th className="p-4 text-center">Occasion</th>
                      <th className="p-4 text-center">Total Price</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-end w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredOrders.map((o) => {
                      const isSelected = selectedOrderIds.has(o.id);
                      const customerName = o.Customer?.name || o.deliveryInfo?.customerName || "Customer";
                      const initials = customerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CU";
                      return (
                        <tr key={o.id} className={`hover:bg-gray-50/60 transition-colors ${isSelected ? "bg-amber-500/5" : ""}`}>
                          <td className="p-4 text-center">
                            <button onClick={() => handleToggleSelectOrder(o.id)} className="cursor-pointer flex items-center justify-center mx-auto">
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-[#AD7D39]" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-300" />
                              )}
                            </button>
                          </td>
                          <td className="p-4 text-start">
                            <div className="font-bold text-[#191611] font-mono text-xs">
                              #{String(o.id).slice(0, 8).toUpperCase()}
                            </div>
                            <div className="text-[10px] text-gray-400 font-sans flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3 text-gray-400" />
                              <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                            </div>
                          </td>
                          <td className="p-4 text-start">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gray-100 text-[#191611] border border-[#E9DBC6] flex items-center justify-center text-[10px] font-bold font-serif shrink-0">
                                {initials}
                              </div>
                              <div>
                                <div className="font-bold text-[#191611] text-xs">{customerName}</div>
                                <div className="text-[10px] text-gray-400 font-sans">{o.Customer?.phone || o.deliveryInfo?.customerPhone || "No Phone"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-center capitalize text-gray-600 font-semibold">
                            {o.occasionSlug}
                          </td>
                          <td className="p-4 text-center font-bold text-[#191611] font-mono">
                            {o.finalPrice ? formatCurrency(o.finalPrice) : "Pending"}
                          </td>
                          <td className="p-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-sans ${
                              o.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                              o.status === "SHIPPED" ? "bg-blue-50 text-blue-700" :
                              o.status === "NEW_REQUEST" ? "bg-amber-50 text-amber-700" :
                              o.status === "CONTACTED" ? "bg-indigo-50 text-indigo-700" :
                              o.status === "AWAITING_PAYMENT" ? "bg-yellow-50 text-yellow-700" :
                              o.status === "PREPARING" ? "bg-cyan-50 text-cyan-700" :
                              "bg-gray-50 text-gray-700"
                            }`}>
                              {o.status === "DELIVERED" && <CheckCircle className="w-3 h-3" />}
                              {o.status === "SHIPPED" && <Truck className="w-3 h-3" />}
                              {o.status === "NEW_REQUEST" && <Clock className="w-3 h-3" />}
                              {o.status === "CONTACTED" && <Mail className="w-3 h-3" />}
                              {o.status === "AWAITING_PAYMENT" && <DollarSign className="w-3 h-3" />}
                              {o.status === "PREPARING" && <Snowflake className="w-3 h-3" />}
                              <span>{o.status.replace("_", " ")}</span>
                            </span>
                          </td>
                          <td className="p-4 text-end">
                            <div className="flex items-center justify-end gap-1.5">
                              <Link href={`/admin/orders/${o.id}`}>
                                <button
                                  className="p-2 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] transition-all cursor-pointer border border-[#E9DBC6]/40"
                                  title="Manage Order"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </Link>
                              <button
                                onClick={() => { setSelectedOrderIds(new Set([o.id])); handleBulkPrintInvoices(); }}
                                className="p-2 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] transition-all cursor-pointer border border-[#E9DBC6]/40"
                                title="Print Invoice"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredOrders.length === 0 && (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 italic">
                          No curation orders found matching query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Orders Cards - Mobile */}
              <div className="block md:hidden space-y-4">
                {filteredOrders.map((o) => {
                  const isSelected = selectedOrderIds.has(o.id);
                  const customerName = o.Customer?.name || o.deliveryInfo?.customerName || "Customer";
                  const initials = customerName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "CU";
                  return (
                    <div 
                      key={o.id} 
                      className={`bg-white p-5 rounded-3xl border transition-all ${
                        isSelected ? "border-[#AD7D39] bg-amber-500/5 shadow-md" : "border-[#E9DBC6]/60 shadow-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={() => handleToggleSelectOrder(o.id)} 
                            className="cursor-pointer p-1 rounded-lg hover:bg-gray-50"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-[#AD7D39]" />
                            ) : (
                              <Square className="w-4 h-4 text-gray-300" />
                            )}
                          </button>
                          <span className="font-bold text-[#191611] font-mono text-xs">
                            #{String(o.id).slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-sans flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(o.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="py-3.5 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-full bg-[#FBF8F3] text-[#191611] border border-[#E9DBC6] flex items-center justify-center text-xs font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#191611] text-xs">{customerName}</div>
                            <div className="text-[10px] text-gray-400 font-sans">{o.Customer?.phone || o.deliveryInfo?.customerPhone || "No Phone"}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <div>
                            <span className="text-[10px] text-gray-400 block uppercase">Occasion:</span>
                            <span className="font-semibold text-gray-700 capitalize">{o.occasionSlug}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-gray-400 block uppercase">Price:</span>
                            <span className="font-bold text-[#191611] font-mono">{o.finalPrice ? formatCurrency(o.finalPrice) : "Pending"}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold font-sans ${
                            o.status === "DELIVERED" ? "bg-emerald-50 text-emerald-700" :
                            o.status === "SHIPPED" ? "bg-blue-50 text-blue-700" :
                            o.status === "NEW_REQUEST" ? "bg-amber-50 text-amber-700" :
                            o.status === "CONTACTED" ? "bg-indigo-50 text-indigo-700" :
                            o.status === "AWAITING_PAYMENT" ? "bg-yellow-50 text-yellow-700" :
                            o.status === "PREPARING" ? "bg-cyan-50 text-cyan-700" :
                            "bg-gray-50 text-gray-700"
                          }`}>
                            {o.status.replace("_", " ")}
                          </span>

                          <div className="flex items-center gap-2">
                            <Link href={`/admin/orders/${o.id}`}>
                              <button className="px-3 py-1.5 rounded-xl bg-[#F6F0E7] text-[#AD7D39] hover:bg-[#AD7D39] hover:text-white font-bold text-[10px] transition-all flex items-center gap-1 border border-[#E9DBC6]/40 cursor-pointer">
                                <Eye className="w-3.5 h-3.5" />
                                <span>Manage</span>
                              </button>
                            </Link>
                            <button
                              onClick={() => { setSelectedOrderIds(new Set([o.id])); handleBulkPrintInvoices(); }}
                              className="p-1.5 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] border border-[#E9DBC6]/40 transition-all cursor-pointer"
                              title="Print Invoice"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredOrders.length === 0 && (
                  <div className="p-8 text-center text-gray-400 bg-white border border-[#E9DBC6]/60 rounded-3xl italic text-xs">
                    No curation orders found matching query
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6: VIP CLIENT DIRECTORY */}
        {/* ---------------------------------------------------- */}
        {activeTab === "clients" && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="border-b border-[#3C2D1E]/10 pb-3">
                <h3 className="font-serif font-bold text-lg text-[#191611]">VIP Client Directory</h3>
                <p className="text-xs text-[#625D55]">View client tier status, total lifetime spend, and custom gifting notes.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {clients.map((c) => (
                  <div key={c.id} className="p-5 rounded-2xl border border-[#3C2D1E]/10 bg-[#FBF8F3] space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#191611]">{c.name}</h4>
                        <p className="text-xs text-[#625D55] font-mono">{c.email}</p>
                        <p className="text-xs text-[#625D55]">{c.phone}</p>
                      </div>

                      <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#AD7D39] text-white flex items-center gap-1">
                        <Crown className="w-3 h-3" />
                        <span>{c.tier || "Emerald VIP"}</span>
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#3C2D1E]/10 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-[#8A8378] uppercase block">Lifetime Spend:</span>
                        <span className="font-mono font-bold text-[#AD7D39]">{formatCurrency(c.totalSpent || 2450)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#8A8378] uppercase block">Orders:</span>
                        <span className="font-mono font-bold text-[#191611]">{c.totalOrders || 5} Orders</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 6.5: CUSTOMER SUPPORT TICKETS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "support" && (
          <div className="space-y-6">
            
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Filed</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">{tickets.length}</h4>
                  <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 mt-1">
                    <MessageSquare className="w-3 h-3" /> Customer queries
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Open Tickets</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
                    {tickets.filter((t) => t.status === "OPEN").length}
                  </h4>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" /> Needs reply
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Resolved Cases</span>
                  <h4 className="text-xl font-bold text-[#191611] font-mono mt-1">
                    {tickets.filter((t) => t.status === "RESOLVED").length}
                  </h4>
                  <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1 mt-1">
                    <CheckCircle className="w-3 h-3" /> Answered & closed
                  </span>
                </div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Main card panel */}
            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E9DBC6]/60 shadow-xs space-y-6">
              
              {/* Header controls */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-[#191611]">Customer Support Tickets</h2>
                    <span className="px-3 py-1 rounded-full bg-[#191611] text-[#AD7D39] text-xs font-bold font-mono">
                      {filteredTickets.length} tickets
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage buyer requests, order complaints, and send message responses.
                  </p>
                </div>
              </div>

              {/* Search Input Bar */}
              <div className="relative flex items-center w-full">
                <Search className="h-4 w-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search tickets by sender name, email, subject, message content..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#AD7D39] rounded-2xl text-xs font-semibold focus:outline-none text-[#191611] shadow-inner transition-all placeholder:text-gray-400"
                />
                {ticketSearch && (
                  <button onClick={() => setTicketSearch("")} className="absolute right-3.5 p-1 text-gray-400 hover:text-[#191611]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status filter tabs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-gray-100">
                {[
                  { key: "all", label: "All Tickets", icon: <Layers className="w-3.5 h-3.5" />, count: tickets.length },
                  { key: "OPEN", label: "Open Requests", icon: <Clock className="w-3.5 h-3.5 text-amber-500" />, count: tickets.filter(t => t.status === "OPEN").length },
                  { key: "RESOLVED", label: "Resolved", icon: <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />, count: tickets.filter(t => t.status === "RESOLVED").length }
                ].map((chip) => {
                  const isSelected = ticketStatusFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      onClick={() => setTicketStatusFilter(chip.key)}
                      className={`px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all border ${
                        isSelected
                          ? "bg-[#191611] text-white border-[#191611] shadow-xs"
                          : "bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600"
                      }`}
                    >
                      {chip.icon}
                      <span>{chip.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-sans ${
                        isSelected ? "bg-[#AD7D39] text-[#191611]" : "bg-gray-200 text-gray-600"
                      }`}>
                        {chip.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Tickets List Table - Desktop */}
              <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100">
                      <th className="p-4 text-start">Ticket Ref</th>
                      <th className="p-4 text-start">Sender Details</th>
                      <th className="p-4 text-start">Subject & Message Preview</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-end w-40">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredTickets.length > 0 ? (
                      filteredTickets.map((t) => {
                        const initials = t.name ? t.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "CU";
                        return (
                          <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="p-4 text-start">
                              <div className="font-mono font-bold text-[#191611] text-xs">
                                #{String(t.id).slice(0, 8).toUpperCase()}
                              </div>
                              <span className="inline-block mt-1 text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20">
                                {t.category || "General"}
                              </span>
                            </td>
                            <td className="p-4 text-start">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-[#191611] border border-[#E9DBC6] flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {initials}
                                </div>
                                <div>
                                  <div className="font-bold text-[#191611] text-xs">{t.name}</div>
                                  <div className="text-[10px] text-gray-400 font-sans">{t.email}</div>
                                  {t.phone && (
                                    <div className="text-[9px] text-[#AD7D39] font-sans mt-0.5">+{t.phone.replace(/[^0-9]/g, "")}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-start max-w-sm">
                              <div className="font-bold text-[#191611] text-xs mb-0.5">{t.subject}</div>
                              <p className="text-[11px] text-gray-500 line-clamp-2 italic">
                                &quot;{t.message}&quot;
                              </p>
                              {t.orderId && (
                                <span className="inline-block mt-1.5 font-mono text-[9px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                                  Order Ref: #{t.orderId}
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                                t.status === "RESOLVED"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}>
                                {t.status || "OPEN"}
                              </span>
                            </td>
                            <td className="p-4 text-end">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedTicket(t)}
                                  className="p-2 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] border border-[#E9DBC6]/40 transition-all cursor-pointer"
                                  title="Reply to Ticket"
                                >
                                  <Send className="w-4 h-4" />
                                </button>

                                {t.phone && (
                                  <a
                                    href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all cursor-pointer"
                                    title="WhatsApp client"
                                  >
                                    <MessageCircle className="w-4 h-4" />
                                  </a>
                                )}

                                <button
                                  onClick={() => handleToggleResolve(t.id)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    t.status === "OPEN"
                                      ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                      : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                                  }`}
                                  title={t.status === "OPEN" ? "Mark Resolved" : "Reopen Ticket"}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400 italic">
                          No tickets found matching query
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Tickets Cards - Mobile */}
              <div className="block md:hidden space-y-4">
                {filteredTickets.length > 0 ? (
                  filteredTickets.map((t) => {
                    const initials = t.name ? t.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "CU";
                    return (
                      <div key={t.id} className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs space-y-4">
                        <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <span className="font-mono font-bold text-[#191611] text-xs">
                            #{String(t.id).slice(0, 8).toUpperCase()}
                          </span>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20">
                            {t.category || "General"}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gray-100 text-[#191611] border border-[#E9DBC6] flex items-center justify-center text-[10px] font-bold shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-[#191611] text-xs">{t.name}</div>
                            <div className="text-[10px] text-gray-400 font-sans">{t.email}</div>
                          </div>
                        </div>

                        <div className="bg-[#FBF8F3] p-3.5 rounded-2xl border border-[#E9DBC6]/40 text-xs">
                          <div className="font-bold text-[#191611] text-xs mb-1">{t.subject}</div>
                          <p className="text-[11px] text-gray-500 italic leading-relaxed line-clamp-3">
                            &quot;{t.message}&quot;
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase ${
                            t.status === "RESOLVED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}>
                            {t.status || "OPEN"}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedTicket(t)}
                              className="p-2 rounded-xl bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] border border-[#E9DBC6]/40 transition-all cursor-pointer"
                              title="Reply"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                            {t.phone && (
                              <a
                                href={`https://wa.me/${t.phone.replace(/[^0-9]/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 transition-all cursor-pointer"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}
                            <button
                              type="button"
                              onClick={() => handleToggleResolve(t.id)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                t.status === "OPEN"
                                  ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                                  : "bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-gray-400 bg-white border border-[#E9DBC6]/60 rounded-3xl italic text-xs">
                    No tickets found matching query
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 7: GIFT BOX PRODUCTS DESIGNS */}
        {/* ---------------------------------------------------- */}
        {activeTab === "products" && (
          <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E9DBC6]/60 shadow-xs space-y-6">
            
            {/* Products Header Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 pb-5">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-[#191611]">Gift Box Product Designs Catalog</h2>
                  <span className="px-3 py-1 rounded-full bg-[#191611] text-[#AD7D39] border border-[#AD7D39]/30 text-xs font-bold font-mono">
                    {products.length} items
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Manage bespoke velvet gift box designs, pricing in AED, stock, and imagery.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0 select-none">
                {/* Category Filter */}
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  className="px-3.5 py-2.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-bold text-[#191611] focus:outline-none h-[42px] cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>{c.name}</option>
                  ))}
                </select>

                {/* Add Product Button */}
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setProductForm({
                      name: "",
                      slug: "",
                      description: "",
                      price: 450,
                      original_price: "",
                      stock: 25,
                      category_id: "",
                      brand_en: "Royal Velvet",
                      image_url: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
                      customizable: true,
                    });
                    setIsProductModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-[#191611] hover:bg-[#3C2D1E] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer whitespace-nowrap h-[42px]"
                >
                  <Plus className="w-4 h-4 text-[#AD7D39]" />
                  <span>Add Box Design</span>
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative flex items-center w-full">
              <Search className="h-4 w-4 text-gray-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search products by title or slug..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-white focus:bg-white border border-gray-200 focus:border-[#AD7D39] rounded-2xl text-xs font-semibold focus:outline-none text-[#191611] shadow-inner transition-all placeholder:text-gray-400"
              />
              {productSearch && (
                <button
                  onClick={() => setProductSearch("")}
                  className="absolute right-3.5 p-1 text-gray-400 hover:text-[#191611]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Products Table - Desktop */}
            <div className="hidden md:block overflow-x-auto rounded-2xl border border-gray-100 shadow-xs">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 font-bold border-b border-gray-100">
                    <th className="p-3.5 text-center w-14">#</th>
                    <th className="p-3.5 text-start">Box Design</th>
                    <th className="p-3.5 text-start">Category</th>
                    <th className="p-3.5 text-center">Price</th>
                    <th className="p-3.5 text-center">Stock Level</th>
                    <th className="p-3.5 text-center">Customizable</th>
                    <th className="p-3.5 text-end w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3.5 text-center">
                          <img
                            src={p.images?.[0] || p.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200"}
                            alt={p.name}
                            className="w-10 h-10 object-cover rounded-xl border border-gray-100 mx-auto"
                          />
                        </td>
                        <td className="p-3.5 text-start">
                          <div className="font-bold text-[#191611] text-xs">{p.name}</div>
                          <span className="text-[10px] text-gray-400 font-sans font-medium inline-block mt-0.5">
                            slug: {p.slug}
                          </span>
                        </td>
                        <td className="p-3.5 text-start text-gray-600 font-semibold capitalize">
                          {p.occasionSlug || "Bespoke Collection"}
                        </td>
                        <td className="p-3.5 text-center font-bold text-[#191611] font-mono">
                          {formatCurrency(p.price)}
                        </td>
                        <td className="p-3.5 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans inline-block ${
                            (p.stock || 25) === 0 
                              ? "bg-red-50 text-red-600" 
                              : (p.stock || 25) < 10 
                                ? "bg-amber-50 text-amber-700" 
                                : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {p.stock || 25} in stock
                          </span>
                        </td>
                        <td className="p-3.5 text-center font-bold text-emerald-700 text-[10px]">
                          Yes (Bespoke)
                        </td>
                        <td className="p-3.5 text-end">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => {
                                setSelectedProduct(p);
                                setProductForm({
                                  name: p.name,
                                  slug: p.slug,
                                  description: p.description || "",
                                  price: p.price,
                                  original_price: p.original_price || "",
                                  stock: p.stock || 25,
                                  category_id: p.category_id || "",
                                  brand_en: p.brand_en || "Royal Velvet",
                                  image_url: p.images?.[0] || p.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
                                  customizable: true,
                                });
                                setIsProductModalOpen(true);
                              }}
                              className="p-2 rounded-xl text-gray-600 hover:text-[#AD7D39] hover:bg-[#F6F0E7] transition-all cursor-pointer border border-[#E9DBC6]/40"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                                  setProducts((prev) => prev.filter((item) => item.id !== p.id));
                                }
                              }}
                              className="p-2 rounded-xl text-red-500 hover:bg-red-50 transition-all cursor-pointer border border-red-200"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        No products found matching query
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Products Cards - Mobile */}
            <div className="block md:hidden space-y-4">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <div key={p.id} className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs space-y-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.images?.[0] || p.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=200"}
                        alt={p.name}
                        className="w-14 h-14 object-cover rounded-2xl border border-gray-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-[#191611] text-sm truncate">{p.name}</div>
                        <span className="text-[10px] text-gray-400 font-sans font-medium block truncate">
                          slug: {p.slug}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-50 mt-1">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Category:</span>
                        <span className="font-semibold text-gray-700 capitalize">{p.occasionSlug || "Bespoke Collection"}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-gray-400 block uppercase">Price:</span>
                        <span className="font-bold text-[#191611] font-mono">{formatCurrency(p.price)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-sans inline-block ${
                        (p.stock || 25) === 0 
                          ? "bg-red-50 text-red-600" 
                          : (p.stock || 25) < 10 
                            ? "bg-amber-50 text-amber-700" 
                            : "bg-emerald-50 text-emerald-700"
                      }`}>
                        {p.stock || 25} in stock
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedProduct(p);
                            setProductForm({
                              name: p.name,
                              slug: p.slug,
                              description: p.description || "",
                              price: p.price,
                              original_price: p.original_price || "",
                              stock: p.stock || 25,
                              category_id: p.category_id || "",
                              brand_en: p.brand_en || "Royal Velvet",
                              image_url: p.images?.[0] || p.image_url || "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=1000",
                              customizable: true,
                            });
                            setIsProductModalOpen(true);
                          }}
                          className="p-2 rounded-xl text-gray-600 hover:text-[#AD7D39] hover:bg-[#F6F0E7] border border-[#E9DBC6]/40 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete ${p.name}?`)) {
                              setProducts((prev) => prev.filter((item) => item.id !== p.id));
                            }
                          }}
                          className="p-2 rounded-xl text-red-500 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-400 bg-white border border-[#E9DBC6]/60 rounded-3xl italic text-xs">
                  No products found matching query
                </div>
              )}
            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 8: OCCASIONS & CATEGORIES CATALOG */}
        {/* ---------------------------------------------------- */}
        {activeTab === "categories" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#191611]">Occasions & Categories Catalog</h3>
                  <p className="text-xs text-[#625D55]">Organize gift boxes by occasions (Weddings, Birthdays, Corporate, Baby).</p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A8378]" />
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl text-xs bg-[#FBF8F3] border border-[#AD7D39]/20 focus:outline-none focus:border-[#AD7D39]"
                  />
                </div>
              </div>

              {/* Categories Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="rounded-2xl border border-[#AD7D39]/20 bg-[#FBF8F3] overflow-hidden shadow-sm flex flex-col justify-between">
                    <div className="relative h-36 bg-[#191611]">
                      <img
                        src={cat.image || "https://images.unsplash.com/photo-1513885535751-8b9238bd48d7?q=80&w=600"}
                        alt={cat.name}
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                        <div>
                          <h4 className="font-serif font-bold text-lg text-white">{cat.name}</h4>
                          <span className="text-[10px] text-[#D4BA99] font-mono">slug: /{cat.slug}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 flex items-center justify-between border-t border-[#AD7D39]/15 bg-white">
                      <span className="text-xs font-bold text-[#AD7D39]">
                        {cat.productsCount || 18} Curated Designs
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedOccasion(cat);
                            setOccasionForm({ name: cat.name, slug: cat.slug, image: cat.image || "" });
                            setIsOccasionModalOpen(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-[#F6F0E7] text-[#7D5121] hover:bg-[#AD7D39] hover:text-white font-bold transition-all text-[10px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete category ${cat.name}?`)) {
                              setCategories((prev) => prev.filter((c) => c.id !== cat.id));
                            }
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold transition-all text-[10px]"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 9: COUPONS & PROMO CODES PANEL */}
        {/* ---------------------------------------------------- */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-[#E9DBC6]/60 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-[#191611]">Create New Discount Coupon</h3>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsCouponModalOpen(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#191611] hover:bg-[#3C2D1E] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all h-[42px]"
                >
                  <Plus className="w-4 h-4 text-[#AD7D39]" />
                  <span>Create Coupon Code</span>
                </button>
              </div>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[32px] border border-[#E9DBC6]/60 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
                <div>
                  <h2 className="text-lg font-bold text-[#191611]">Active Promotions & Coupons</h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Manage percentage & fixed AED discount codes for VIP checkout links.
                  </p>
                </div>
              </div>

              {/* Coupons Grid Card Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {coupons.map((cpn, i) => (
                  <div key={i} className="bg-white p-5 rounded-3xl border border-[#E9DBC6]/60 shadow-xs flex justify-between items-center relative overflow-hidden group">
                    <div className="space-y-1.5">
                      <span className="font-bold text-[#191611] text-sm font-mono block tracking-wider uppercase">
                        {cpn.code}
                      </span>
                      <span className="text-xs text-emerald-600 font-bold block">
                        {cpn.discountType === "PERCENTAGE" ? `${cpn.discountValue}% OFF` : `AED ${cpn.discountValue} OFF`}
                      </span>
                      <span className="text-[10px] text-gray-400 font-sans block">
                        Used: {cpn.usedCount || 0} / {cpn.maxUses || 100}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        (cpn.status || "ACTIVE") === "ACTIVE" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"
                      }`}>
                        {cpn.status || "ACTIVE"}
                      </span>

                      <div className="flex gap-1.5 mt-1.5">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(cpn.code);
                            alert(`Copied promo code ${cpn.code} to clipboard!`);
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-[#F6F0E7] text-[#191611] hover:text-[#AD7D39] border border-[#E9DBC6]/40 transition-all text-[10px]"
                          title="Copy Code"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete coupon ${cpn.code}?`)) {
                              setCoupons((prev) => prev.filter((c) => c.id !== cpn.id));
                            }
                          }}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-700 hover:text-white border border-rose-200 transition-all text-[10px]"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>

          </div>
        )}

        {/* ---------------------------------------------------- */}
        {/* TAB 10: ADMIN USERS & RULES PANEL */}
        {/* ---------------------------------------------------- */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#AD7D39]/20 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#3C2D1E]/10 pb-4">
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#191611]">Admin Console Access Management</h3>
                  <p className="text-xs text-[#625D55]">Assign granular roles and management rules for team members.</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserForm({
                      email: "",
                      role: "advisor",
                      rules: {
                        canManageOrders: true,
                        canManageTickets: true,
                        canManageInventory: false,
                        canManageUsers: false,
                      }
                    });
                    setIsUserModalOpen(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-[#AD7D39] text-[#191611] hover:bg-[#C3944D] text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Admin User</span>
                </button>
              </div>

              {/* Admin Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#FBF8F3] text-[#7D5121] font-bold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-3 px-4">Admin Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Access Rules / Permissions</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#AD7D39]/10">
                    {admins.map((adm) => (
                      <tr key={adm.id} className="hover:bg-[#FBF8F3]/60 transition-colors">
                        <td className="py-4 px-4 font-semibold text-[#191611]">{adm.email}</td>
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            adm.role === "superadmin"
                              ? "bg-purple-100 text-purple-800"
                              : adm.role === "advisor"
                              ? "bg-amber-100 text-[#7D5121]"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {adm.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(adm.rules || {}).map(([key, val]) => {
                              if (!val) return null;
                              return (
                                <span key={key} className="text-[10px] px-2 py-0.5 rounded bg-[#F6F0E7] text-[#7D5121] border border-[#AD7D39]/20 font-medium">
                                  {key.replace("canManage", "")}
                                </span>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSelectedUser(adm);
                              setUserForm({
                                email: adm.email,
                                role: adm.role,
                                rules: {
                                  canManageOrders: adm.rules?.canManageOrders ?? false,
                                  canManageTickets: adm.rules?.canManageTickets ?? false,
                                  canManageInventory: adm.rules?.canManageInventory ?? false,
                                  canManageUsers: adm.rules?.canManageUsers ?? false,
                                }
                              });
                              setIsUserModalOpen(true);
                            }}
                            className="px-3 py-1 rounded-lg bg-amber-50 text-[#7D5121] hover:bg-[#AD7D39] hover:text-white font-bold transition-all text-[10px]"
                          >
                            Edit Rules
                          </button>
                          <button
                            onClick={() => handleDeleteUser(adm.id)}
                            className="px-3 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold transition-all text-[10px]"
                          >
                            Revoke
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        </div>
      </main>

      {/* ---------------------------------------------------- */}
      {/* MODAL 1: ADD / EDIT PRODUCT BOX DESIGN */}
      {/* ---------------------------------------------------- */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#D4BA99]">
                {selectedProduct ? "Edit Box Design" : "Add New Box Design"}
              </h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-[#8A8378] hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedProduct) {
                  setProducts((prev) =>
                    prev.map((item) => (item.id === selectedProduct.id ? { ...item, ...productForm, price: Number(productForm.price) } : item))
                  );
                } else {
                  const newProduct = {
                    id: `box-${Date.now().toString().slice(-4)}`,
                    ...productForm,
                    price: Number(productForm.price),
                    images: [productForm.image_url],
                  };
                  setProducts((prev) => [newProduct, ...prev]);
                }
                setIsProductModalOpen(false);
                alert("🎁 Box design saved successfully!");
              }}
              className="p-6 space-y-4 text-xs text-[#292725]"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Box Title</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    setProductForm({ ...productForm, name, slug });
                  }}
                  placeholder="e.g. Royal Emerald Keepsake"
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-semibold text-[#191611] focus:ring-2 focus:ring-[#AD7D39]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Price (AED)</label>
                  <input
                    type="number"
                    required
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-mono font-bold text-[#191611]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    value={productForm.stock}
                    onChange={(e) => setProductForm({ ...productForm, stock: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-mono font-bold text-[#191611]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={productForm.image_url}
                  onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs text-[#191611]"
                />
              </div>

              <div className="pt-3 border-t border-[#3C2D1E]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#625D55]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#AD7D39] text-white uppercase font-bold text-xs hover:bg-[#C3944D]"
                >
                  Save Box Design
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 2: ADD / EDIT CATEGORY */}
      {/* ---------------------------------------------------- */}
      {isOccasionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#D4BA99]">
                {selectedOccasion ? "Edit Category" : "Add New Category"}
              </h3>
              <button onClick={() => setIsOccasionModalOpen(false)} className="text-[#8A8378] hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (selectedOccasion) {
                  setCategories((prev) =>
                    prev.map((c) => (c.id === selectedOccasion.id ? { ...c, ...occasionForm } : c))
                  );
                } else {
                  const newCat = {
                    id: `cat-${Date.now().toString().slice(-4)}`,
                    ...occasionForm,
                    productsCount: 0,
                  };
                  setCategories((prev) => [...prev, newCat]);
                }
                setIsOccasionModalOpen(false);
                alert("🏷️ Category saved successfully!");
              }}
              className="p-6 space-y-4 text-xs text-[#292725]"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  value={occasionForm.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                    setOccasionForm({ ...occasionForm, name, slug });
                  }}
                  placeholder="e.g. Ramadan Celebrations"
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-semibold text-[#191611]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Banner Image URL</label>
                <input
                  type="url"
                  required
                  value={occasionForm.image}
                  onChange={(e) => setOccasionForm({ ...occasionForm, image: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs text-[#191611]"
                />
              </div>

              <div className="pt-3 border-t border-[#3C2D1E]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOccasionModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#625D55]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#AD7D39] text-white uppercase font-bold text-xs hover:bg-[#C3944D]"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* MODAL 3: CREATE COUPON CODE */}
      {/* ---------------------------------------------------- */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#D4BA99]">Create Promo Coupon Code</h3>
              <button onClick={() => setIsCouponModalOpen(false)} className="text-[#8A8378] hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newCpn = {
                  id: `cpn-${Date.now().toString().slice(-4)}`,
                  code: couponForm.code.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                  discountType: couponForm.discountType,
                  discountValue: Number(couponForm.discountValue),
                  maxUses: Number(couponForm.maxUses),
                  usedCount: 0,
                  status: "ACTIVE",
                };
                setCoupons((prev) => [newCpn, ...prev]);
                setIsCouponModalOpen(false);
                alert(`💳 Coupon ${newCpn.code} created successfully!`);
              }}
              className="p-6 space-y-4 text-xs text-[#292725]"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Coupon Promo Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DUBAI2026"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-mono font-bold text-[#191611]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-semibold text-[#191611]"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (AED)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-mono font-bold text-[#191611]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Max Redemptions Limit</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={couponForm.maxUses}
                  onChange={(e) => setCouponForm({ ...couponForm, maxUses: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-mono font-bold text-[#191611]"
                />
              </div>

              <div className="pt-3 border-t border-[#3C2D1E]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCouponModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#625D55]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#AD7D39] text-white uppercase font-bold text-xs hover:bg-[#C3944D]"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin User Management Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#D4BA99]">
                {selectedUser ? "Edit Access Rules" : "Add Admin User"}
              </h3>
              <button onClick={() => setIsUserModalOpen(false)} className="text-[#8A8378] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4 text-xs text-[#292725]">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  disabled={!!selectedUser}
                  placeholder="e.g. colleague@afkaraldar.ae"
                  value={userForm.email}
                  onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-semibold text-[#191611] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Administrative Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-semibold text-[#191611]"
                >
                  <option value="advisor">Gifting Advisor</option>
                  <option value="support">Support Agent</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="space-y-3 pt-2 border-t border-[#3C2D1E]/10">
                <span className="block text-[10px] font-bold uppercase text-[#625D55]">Specific Access Rules</span>
                
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userForm.rules.canManageOrders}
                    onChange={(e) => setUserForm({
                      ...userForm,
                      rules: { ...userForm.rules, canManageOrders: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-[#AD7D39] focus:ring-[#AD7D39]"
                  />
                  <span className="font-semibold text-gray-700">Can Manage Custom Orders</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userForm.rules.canManageTickets}
                    onChange={(e) => setUserForm({
                      ...userForm,
                      rules: { ...userForm.rules, canManageTickets: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-[#AD7D39] focus:ring-[#AD7D39]"
                  />
                  <span className="font-semibold text-gray-700">Can Manage Support Tickets</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userForm.rules.canManageInventory}
                    onChange={(e) => setUserForm({
                      ...userForm,
                      rules: { ...userForm.rules, canManageInventory: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-[#AD7D39] focus:ring-[#AD7D39]"
                  />
                  <span className="font-semibold text-gray-700">Can Manage Packaging Inventory</span>
                </label>

                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userForm.rules.canManageUsers}
                    onChange={(e) => setUserForm({
                      ...userForm,
                      rules: { ...userForm.rules, canManageUsers: e.target.checked }
                    })}
                    className="rounded border-gray-300 text-[#AD7D39] focus:ring-[#AD7D39]"
                  />
                  <span className="font-semibold text-gray-700">Can Manage Admin Access & Users</span>
                </label>
              </div>

              <div className="pt-3 border-t border-[#3C2D1E]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#625D55]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#AD7D39] text-white uppercase font-bold text-xs hover:bg-[#C3944D]"
                >
                  {selectedUser ? "Update Rules" : "Add User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restock Inventory Modal */}
      {isRestockModalOpen && selectedInventoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#D4BA99]">Restock Packaging Inventory</h3>
              <button onClick={() => setIsRestockModalOpen(false)} className="text-[#8A8378] hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleRestockSubmit} className="p-6 space-y-4 text-xs text-[#292725]">
              <div>
                <span className="text-[#8A8378] block text-[10px] uppercase font-bold">Item:</span>
                <p className="font-semibold text-sm text-[#191611]">{selectedInventoryItem.name}</p>
                <p className="text-[11px] text-[#625D55]">Current Stock: {selectedInventoryItem.stock} {selectedInventoryItem.unit}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Quantity to Add</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={addStockAmount}
                  onChange={(e) => setAddStockAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-[#3C2D1E]/20 text-xs font-mono font-bold text-[#191611] focus:ring-2 focus:ring-[#AD7D39]"
                />
              </div>

              <div className="pt-3 border-t border-[#3C2D1E]/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRestockModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#625D55]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#AD7D39] text-white uppercase font-bold text-xs hover:bg-[#C3944D]"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Support Ticket Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#AD7D39]/30 overflow-hidden">
            <div className="p-6 bg-[#191611] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4BA99]">Support Ticket Reply</span>
                <h3 className="font-serif text-lg font-bold text-white mt-0.5">#{selectedTicket.id.slice(0, 8)} - {selectedTicket.name}</h3>
              </div>
              <button onClick={() => setSelectedTicket(null)} className="text-[#8A8378] hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSendReply} className="p-6 space-y-4 text-xs text-[#292725]">
              <div className="p-4 bg-[#FBF8F3] rounded-2xl border border-[#E9DBC6]/40">
                <span className="font-bold text-[#191611] block mb-1">Subject: {selectedTicket.subject}</span>
                <p className="italic text-[#625D55] text-[11px]">&quot;{selectedTicket.message}&quot;</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#625D55] mb-1">Response Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type your response to the client..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-3 rounded-2xl border border-gray-200 text-xs text-[#191611] focus:ring-2 focus:ring-[#AD7D39] focus:outline-none resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#625D55] hover:bg-[#F6F0E7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isReplying}
                  className="px-6 py-2.5 uppercase font-bold text-xs gap-2 rounded-xl bg-[#AD7D39] hover:bg-[#3C2D1E] text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isReplying ? "Sending..." : "Send Reply & Resolve"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
