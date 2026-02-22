import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { 
    ChefHat, Plus, Minus, Trash2, ShoppingCart, Send, 
    ArrowLeft, MessageSquare, Users, Search, X, Loader2, Egg, Package,
    Settings2, Check
} from 'lucide-react';

// Productos de desayuno que requieren selección de tipo de huevo
const BREAKFAST_PRODUCTS_WITH_EGGS = [
    'DESAYUNO TICO',
    'DESAYUNO FOGON',
    'DESAYUNO ECONOMICO',
    'DESAYUNO',
    'MINI PINTO',
    'PORCIÓN DE HUEVO'
];

// Configuración de variantes por producto
const PRODUCT_VARIANTS = {
    // Hamburguesas - tipo de carne + exclusiones
    'HAMBURGUESA MI FOGON': {
        type: 'multi',
        title: 'Personaliza tu Hamburguesa',
        icon: '🍔',
        options: [
            {
                group: 'Tipo de carne',
                required: true,
                single: true,
                choices: [
                    { label: '🥩 Carne de Res', value: 'Res' },
                    { label: '🍗 Pollo', value: 'Pollo' }
                ]
            },
            {
                group: 'Sin ingredientes',
                required: false,
                single: false,
                choices: [
                    { label: '🥒 Sin Pepinillos', value: 'Sin Pepinillos' },
                    { label: '🧅 Sin Cebolla', value: 'Sin Cebolla' },
                    { label: '🍅 Sin Tomate', value: 'Sin Tomate' },
                    { label: '🥬 Sin Lechuga', value: 'Sin Lechuga' }
                ]
            }
        ]
    },
    'HAMBURGUESA BBQ': {
        type: 'multi',
        title: 'Personaliza tu Hamburguesa BBQ',
        icon: '🍔',
        options: [
            {
                group: 'Tipo de carne',
                required: true,
                single: true,
                choices: [
                    { label: '🥩 Carne de Res', value: 'Res' },
                    { label: '🍗 Pollo', value: 'Pollo' }
                ]
            },
            {
                group: 'Sin ingredientes',
                required: false,
                single: false,
                choices: [
                    { label: '🥒 Sin Pepinillos', value: 'Sin Pepinillos' },
                    { label: '🧅 Sin Cebolla', value: 'Sin Cebolla' },
                    { label: '🍅 Sin Tomate', value: 'Sin Tomate' }
                ]
            }
        ]
    },
    // Sopas Aztecas - exclusiones
    'SOPA AZTECA': {
        type: 'multi',
        title: 'Personaliza tu Sopa Azteca',
        icon: '🍲',
        options: [
            {
                group: 'Preparación',
                required: false,
                single: true,
                choices: [
                    { label: '✅ Con Todo', value: 'Con Todo' }
                ]
            },
            {
                group: 'Sin ingredientes',
                required: false,
                single: false,
                choices: [
                    { label: '🧀 Sin Queso', value: 'Sin Queso' },
                    { label: '🌽 Sin Chips', value: 'Sin Chips' },
                    { label: '🍗 Sin Pollo', value: 'Sin Pollo' },
                    { label: '🥑 Sin Aguacate', value: 'Sin Aguacate' },
                    { label: '🌶️ Sin Chile', value: 'Sin Chile' }
                ]
            }
        ]
    },
    'SOPA AZTECA PEQUEÑA': {
        type: 'multi',
        title: 'Personaliza tu Sopa Azteca',
        icon: '🍲',
        options: [
            {
                group: 'Preparación',
                required: false,
                single: true,
                choices: [
                    { label: '✅ Con Todo', value: 'Con Todo' }
                ]
            },
            {
                group: 'Sin ingredientes',
                required: false,
                single: false,
                choices: [
                    { label: '🧀 Sin Queso', value: 'Sin Queso' },
                    { label: '🌽 Sin Chips', value: 'Sin Chips' },
                    { label: '🍗 Sin Pollo', value: 'Sin Pollo' },
                    { label: '🥑 Sin Aguacate', value: 'Sin Aguacate' }
                ]
            }
        ]
    },
    // Quesadilla - tipo de relleno
    'QUESADILLA': {
        type: 'multi',
        title: 'Personaliza tu Quesadilla',
        icon: '🌮',
        options: [
            {
                group: 'Tipo de relleno',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo', value: 'Pollo' },
                    { label: '🥩 Carne', value: 'Carne' },
                    { label: '🧀 Solo Queso', value: 'Solo Queso' }
                ]
            }
        ]
    },
    // Burrito - tipo de relleno
    'BURRITO MI FOGON': {
        type: 'multi',
        title: 'Personaliza tu Burrito',
        icon: '🌯',
        options: [
            {
                group: 'Tipo de relleno',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo', value: 'Pollo' },
                    { label: '🥩 Carne', value: 'Carne' }
                ]
            },
            {
                group: 'Sin ingredientes',
                required: false,
                single: false,
                choices: [
                    { label: '🌶️ Sin Picante', value: 'Sin Picante' },
                    { label: '🧅 Sin Cebolla', value: 'Sin Cebolla' }
                ]
            }
        ]
    },
    // Pizza - tipo
    'PIZZA': {
        type: 'multi',
        title: 'Elige tu Pizza',
        icon: '🍕',
        options: [
            {
                group: 'Tipo de Pizza',
                required: true,
                single: true,
                choices: [
                    { label: '🥓 Jamón y Queso', value: 'Jamón y Queso' },
                    { label: '🌶️ Pepperoni', value: 'Pepperoni' }
                ]
            }
        ]
    },
    // Chocolates - sencillo o con malvaviscos
    'CHOCOLATE': {
        type: 'multi',
        title: '¿Cómo lo desea?',
        icon: '☕',
        options: [
            {
                group: 'Tipo',
                required: true,
                single: true,
                choices: [
                    { label: '☕ Sencillo', value: 'Sencillo' },
                    { label: '🍡 Con Malvaviscos', value: 'Con Malvaviscos' }
                ]
            }
        ]
    },
    'CHOCOLATE PEQUEÑO': {
        type: 'multi',
        title: '¿Cómo lo desea?',
        icon: '☕',
        options: [
            {
                group: 'Tipo',
                required: true,
                single: true,
                choices: [
                    { label: '☕ Sencillo', value: 'Sencillo' },
                    { label: '🍡 Con Malvaviscos', value: 'Con Malvaviscos' }
                ]
            }
        ]
    },
    // Ensalada
    'ENSALADA DE POLLO O CARNE': {
        type: 'multi',
        title: 'Elige tu Ensalada',
        icon: '🥗',
        options: [
            {
                group: 'Tipo de proteína',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo', value: 'Pollo' },
                    { label: '🥩 Carne', value: 'Carne' }
                ]
            }
        ]
    },
    // Arroz con Pollo o Carne
    'ARROZ CON POLLO O CARNE': {
        type: 'multi',
        title: 'Elige tu Arroz',
        icon: '🍚',
        options: [
            {
                group: 'Tipo de proteína',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo', value: 'Pollo' },
                    { label: '🥩 Carne', value: 'Carne' }
                ]
            }
        ]
    },
    // Crepa de Pollo
    'CREPA DE POLLO': {
        type: 'multi',
        title: 'Personaliza tu Crepa',
        icon: '🥞',
        options: [
            {
                group: 'Tipo de relleno',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo', value: 'Pollo' },
                    { label: '🥩 Carne', value: 'Carne' }
                ]
            }
        ]
    },
    // Pasta - salsa, proteína y tipo de pasta
    'PASTA MINIALBONDIGAS': {
        type: 'multi',
        title: 'Personaliza tu Pasta',
        icon: '🍝',
        options: [
            {
                group: 'Tipo de salsa',
                required: true,
                single: true,
                choices: [
                    { label: '🔴 Roja', value: 'Roja' },
                    { label: '⚪ Blanca', value: 'Blanca' },
                    { label: '🟠 Aurora', value: 'Aurora' }
                ]
            },
            {
                group: 'Tipo de pasta',
                required: true,
                single: true,
                choices: [
                    { label: '🍝 Fettuccini', value: 'Fettuccini' },
                    { label: '🍜 Spaghetti', value: 'Spaghetti' }
                ]
            }
        ]
    },
    'PASTA CAMARONES': {
        type: 'multi',
        title: 'Personaliza tu Pasta',
        icon: '🍝',
        options: [
            {
                group: 'Tipo de salsa',
                required: true,
                single: true,
                choices: [
                    { label: '🔴 Roja', value: 'Roja' },
                    { label: '⚪ Blanca', value: 'Blanca' },
                    { label: '🟠 Aurora', value: 'Aurora' }
                ]
            },
            {
                group: 'Tipo de pasta',
                required: true,
                single: true,
                choices: [
                    { label: '🍝 Fettuccini', value: 'Fettuccini' },
                    { label: '🍜 Spaghetti', value: 'Spaghetti' }
                ]
            }
        ]
    },
    'PASTA POLLO': {
        type: 'multi',
        title: 'Personaliza tu Pasta',
        icon: '🍝',
        options: [
            {
                group: 'Tipo de salsa',
                required: true,
                single: true,
                choices: [
                    { label: '🔴 Roja', value: 'Roja' },
                    { label: '⚪ Blanca', value: 'Blanca' },
                    { label: '🟠 Aurora', value: 'Aurora' }
                ]
            },
            {
                group: 'Tipo de pasta',
                required: true,
                single: true,
                choices: [
                    { label: '🍝 Fettuccini', value: 'Fettuccini' },
                    { label: '🍜 Spaghetti', value: 'Spaghetti' }
                ]
            }
        ]
    },
    // Fuze - sabor
    'FUZE': {
        type: 'multi',
        title: 'Elige el sabor',
        icon: '🍵',
        options: [
            {
                group: 'Sabor',
                required: true,
                single: true,
                choices: [
                    { label: '🍋 Limón', value: 'Limón' },
                    { label: '🍑 Melocotón', value: 'Melocotón' }
                ]
            }
        ]
    },
    // Casados - tipo de proteína y preparación
    'CASADO': {
        type: 'multi',
        title: 'Elige tu Casado',
        icon: '🍽️',
        options: [
            {
                group: 'Tipo de proteína',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo a la Plancha', value: 'Pollo a la Plancha' },
                    { label: '🍗 Pollo Empanizado', value: 'Pollo Empanizado' },
                    { label: '🍗 Pollo en Fajitas a la Plancha', value: 'Pollo en Fajitas a la Plancha' },
                    { label: '🍗 Pollo en Fajitas Empanizadas', value: 'Pollo en Fajitas Empanizadas' },
                    { label: '🧄 Pollo al Ajillo', value: 'Pollo al Ajillo' },
                    { label: '🥩 Bistec con Cebolla', value: 'Bistec con Cebolla' },
                    { label: '🥩 Bistec sin Cebolla', value: 'Bistec sin Cebolla' },
                    { label: '🥩 Bistec en Fajitas', value: 'Bistec en Fajitas' },
                    { label: '🐟 Pescado a la Plancha', value: 'Pescado a la Plancha' },
                    { label: '🐟 Pescado Empanizado', value: 'Pescado Empanizado' },
                    { label: '🧄 Pescado al Ajillo', value: 'Pescado al Ajillo' }
                ]
            },
            {
                group: 'Acompañamientos',
                required: false,
                single: false,
                choices: [
                    { label: '🚫 Sin Arroz', value: 'Sin Arroz' },
                    { label: '🚫 Sin Frijoles', value: 'Sin Frijoles' },
                    { label: '🚫 Sin Ensalada', value: 'Sin Ensalada' },
                    { label: '🥗 Ensalada con Aderezo', value: 'Ensalada con Aderezo' },
                    { label: '🥗 Ensalada sin Aderezo', value: 'Ensalada sin Aderezo' }
                ]
            }
        ]
    },
    'CASADO GRANDE': {
        type: 'multi',
        title: 'Elige tu Casado Grande',
        icon: '🍽️',
        options: [
            {
                group: 'Tipo de proteína',
                required: true,
                single: true,
                choices: [
                    { label: '🍗 Pollo a la Plancha', value: 'Pollo a la Plancha' },
                    { label: '🍗 Pollo Empanizado', value: 'Pollo Empanizado' },
                    { label: '🍗 Pollo en Fajitas a la Plancha', value: 'Pollo en Fajitas a la Plancha' },
                    { label: '🍗 Pollo en Fajitas Empanizadas', value: 'Pollo en Fajitas Empanizadas' },
                    { label: '🧄 Pollo al Ajillo', value: 'Pollo al Ajillo' },
                    { label: '🥩 Bistec con Cebolla', value: 'Bistec con Cebolla' },
                    { label: '🥩 Bistec sin Cebolla', value: 'Bistec sin Cebolla' },
                    { label: '🥩 Bistec en Fajitas', value: 'Bistec en Fajitas' },
                    { label: '🐟 Pescado a la Plancha', value: 'Pescado a la Plancha' },
                    { label: '🐟 Pescado Empanizado', value: 'Pescado Empanizado' },
                    { label: '🧄 Pescado al Ajillo', value: 'Pescado al Ajillo' }
                ]
            },
            {
                group: 'Acompañamientos',
                required: false,
                single: false,
                choices: [
                    { label: '🚫 Sin Arroz', value: 'Sin Arroz' },
                    { label: '🚫 Sin Frijoles', value: 'Sin Frijoles' },
                    { label: '🚫 Sin Ensalada', value: 'Sin Ensalada' },
                    { label: '🥗 Ensalada con Aderezo', value: 'Ensalada con Aderezo' },
                    { label: '🥗 Ensalada sin Aderezo', value: 'Ensalada sin Aderezo' }
                ]
            }
        ]
    }
};

export default function CreateOrder({ table, menu, taxConfig }) {
    // Cargar carrito desde localStorage al iniciar
    const [cart, setCart] = useState(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem(`cart_table_${table.id}`);
                return saved ? JSON.parse(saved) : [];
            } catch (e) {
                console.error('Error loading cart:', e);
                return [];
            }
        }
        return [];
    });
    const [orderNotes, setOrderNotes] = useState('');
    const [activeCategory, setActiveCategory] = useState(menu?.categorias?.[0]?.nombre || '');
    const [itemNotes, setItemNotes] = useState({});
    const [showNotesFor, setShowNotesFor] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false); // Pausar refresh cuando escribe
    const [isSubmitting, setIsSubmitting] = useState(false);
    const searchInputRef = useRef(null);
    const [eggModal, setEggModal] = useState({ show: false, item: null, category: null });
    const [isTakeout, setIsTakeout] = useState(false);
    const [variantModal, setVariantModal] = useState({ show: false, item: null, category: null, config: null });
    const [variantSelections, setVariantSelections] = useState({});

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        if (typeof window !== 'undefined' && cart) {
            try {
                localStorage.setItem(`cart_table_${table.id}`, JSON.stringify(cart));
            } catch (e) {
                console.error('Error saving cart:', e);
            }
        }
    }, [cart, table.id]);

    // Filtrar productos por búsqueda
    const filteredItems = useMemo(() => {
        if (!menu?.categorias) return [];
        
        if (!searchQuery.trim()) {
            return menu.categorias.find(c => c.nombre === activeCategory)?.items || [];
        }
        
        // Buscar en todas las categorías
        const query = searchQuery.toLowerCase().trim();
        const results = [];
        menu.categorias.forEach(cat => {
            cat.items?.forEach(item => {
                if (item.nombre.toLowerCase().includes(query)) {
                    results.push({ ...item, category: cat.nombre });
                }
            });
        });
        return results;
    }, [searchQuery, activeCategory, menu?.categorias]);

    // Configuración de impuestos
    const ivaRate = taxConfig?.iva_rate || 13;
    const serviceRate = taxConfig?.service_rate || 10;
    const currency = taxConfig?.currency || '₡';

    const addToCart = useCallback((item, category, eggType = null, variantNote = null) => {
        const productName = item.nombre.toUpperCase();
        
        // Verificar si el producto tiene variantes configuradas
        const variantConfig = PRODUCT_VARIANTS[productName];
        if (variantConfig && !variantNote && !eggType) {
            // Resetear selecciones anteriores
            setVariantSelections({});
            setVariantModal({ show: true, item, category, config: variantConfig });
            return;
        }
        
        // Si es un producto de desayuno con huevos y no se ha seleccionado el tipo
        if (BREAKFAST_PRODUCTS_WITH_EGGS.includes(productName) && !eggType && !variantNote) {
            setEggModal({ show: true, item, category });
            return;
        }

        // Crear la nota con el tipo de huevo si aplica
        const eggNote = eggType ? `Huevos ${eggType}` : '';
        const existingNote = itemNotes[item.nombre] || '';
        
        // Combinar notas: variante > huevo > nota manual
        let finalNote = '';
        if (variantNote) {
            finalNote = variantNote;
            if (existingNote) finalNote += `, ${existingNote}`;
        } else if (eggNote) {
            finalNote = existingNote ? `${eggNote}, ${existingNote}` : eggNote;
        } else {
            finalNote = existingNote;
        }

        setCart(prevCart => {
            const existingIndex = prevCart.findIndex(
                c => c.product_name === item.nombre && c.notes === finalNote
            );

            if (existingIndex >= 0) {
                const newCart = [...prevCart];
                newCart[existingIndex].quantity += 1;
                return newCart;
            } else {
                return [...prevCart, {
                    product_name: item.nombre,
                    price: item.precio,
                    quantity: 1,
                    notes: finalNote,
                    category: category,
                    tax_type: item.tax_type || 'iva',
                    apply_service: item.apply_service !== false,
                }];
            }
        });

        // Cerrar los modals si estaban abiertos
        if (eggModal.show) {
            setEggModal({ show: false, item: null, category: null });
        }
        if (variantModal.show) {
            setVariantModal({ show: false, item: null, category: null, config: null });
        }
    }, [itemNotes, eggModal.show, variantModal.show]);

    // Función para manejar la selección de variantes
    const handleVariantToggle = (groupIndex, value, isSingle) => {
        setVariantSelections(prev => {
            const current = prev[groupIndex] || [];
            if (isSingle) {
                return { ...prev, [groupIndex]: [value] };
            } else {
                if (current.includes(value)) {
                    return { ...prev, [groupIndex]: current.filter(v => v !== value) };
                } else {
                    return { ...prev, [groupIndex]: [...current, value] };
                }
            }
        });
    };

    // Función para confirmar variantes y agregar al carrito
    const handleVariantConfirm = () => {
        if (!variantModal.item || !variantModal.config) return;
        
        const config = variantModal.config;
        for (let i = 0; i < config.options.length; i++) {
            if (config.options[i].required && (!variantSelections[i] || variantSelections[i].length === 0)) {
                alert(`Por favor selecciona: ${config.options[i].group}`);
                return;
            }
        }

        const noteParts = [];
        config.options.forEach((option, index) => {
            const selected = variantSelections[index] || [];
            if (selected.length > 0) {
                noteParts.push(...selected);
            }
        });

        const variantNote = noteParts.join(', ');
        addToCart(variantModal.item, variantModal.category, null, variantNote);
        setVariantSelections({});
    };

    // Función para cancelar selección de variantes
    const handleVariantCancel = () => {
        setVariantModal({ show: false, item: null, category: null, config: null });
        setVariantSelections({});
    };

    // Función para manejar la selección del tipo de huevo
    const handleEggSelection = (eggType) => {
        if (eggModal.item) {
            addToCart(eggModal.item, eggModal.category, eggType);
        }
        setEggModal({ show: false, item: null, category: null });
    };

    const updateQuantity = useCallback((index, delta) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart[index].quantity += delta;
            if (newCart[index].quantity <= 0) {
                newCart.splice(index, 1);
            }
            return newCart;
        });
    }, []);

    const removeFromCart = useCallback((index) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart.splice(index, 1);
            return newCart;
        });
    }, []);

    // Limpiar carrito después de enviar exitosamente
    const clearCart = useCallback(() => {
        setCart([]);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(`cart_table_${table.id}`);
        }
    }, [table.id]);

    const getSubtotal = () => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calcular IVA solo para productos con tax_type='iva'
    const getTax = () => {
        const taxableAmount = cart
            .filter(item => item.tax_type === 'iva')
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return taxableAmount * (ivaRate / 100);
    };
    
    // Calcular servicio solo para productos con apply_service=true
    // No se cobra servicio para pedidos para llevar
    const serviceAmount = useMemo(() => {
        console.log('Calculando servicio - isTakeout:', isTakeout);
        if (isTakeout) {
            console.log('Es para llevar - retornando 0');
            return 0;
        }
        const serviceableAmount = cart
            .filter(item => item.apply_service)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const result = serviceableAmount * (serviceRate / 100);
        console.log('Servicio calculado:', result);
        return result;
    }, [cart, isTakeout, serviceRate]);
    
    const getService = () => serviceAmount;
    
    const getTotal = () => getSubtotal() + getTax() + getService();

    const handleSubmit = useCallback(() => {
        if (cart.length === 0) {
            alert('Agrega al menos un producto al pedido');
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);

        // Preparar items con valores limpios
        const cleanItems = cart.map(item => ({
            product_name: item.product_name,
            price: Number(item.price),
            quantity: Number(item.quantity),
            notes: item.notes || null,
            category: item.category || 'general',
            tax_type: item.tax_type || 'iva',
            apply_service: Boolean(item.apply_service),
        }));

        console.log('Enviando pedido:', { table_id: table.id, items: cleanItems, notes: orderNotes || null, is_takeout: isTakeout });

        router.post('/orders', {
            table_id: table.id,
            items: cleanItems,
            notes: orderNotes || null,
            is_takeout: isTakeout,
        }, {
            onError: (errors) => {
                console.error('Error al crear pedido:', errors);
                alert('Error al crear el pedido: ' + JSON.stringify(errors));
                setIsSubmitting(false);
            },
            onSuccess: () => {
                console.log('Pedido creado exitosamente');
                // Limpiar localStorage del carrito
                if (typeof window !== 'undefined') {
                    localStorage.removeItem(`cart_table_${table.id}`);
                }
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    }, [cart, isSubmitting, orderNotes, table.id]);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center min-w-0">
                        <button
                            onClick={() => router.visit('/tables')}
                            className="mr-2 sm:mr-3 p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg flex-shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                        <ChefHat className="h-5 w-5 sm:h-6 sm:w-6 mr-1.5 sm:mr-2 text-orange-500 flex-shrink-0" />
                        <h2 className="text-base sm:text-xl font-semibold leading-tight text-gray-800 truncate">
                            <span className="hidden sm:inline">Nuevo Pedido - </span>Mesa {table.number}
                        </h2>
                    </div>
                    <div className="hidden sm:flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        Cap: {table.capacity}
                    </div>
                </div>
            }
        >
            <Head title={`Pedido - Mesa ${table.number}`} />

            <div className="py-2 sm:py-4">
                <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                        {/* Menu Section */}
                        <div className="flex-1 order-2 lg:order-1">
                            {/* Search Bar */}
                            <div className="bg-white rounded-xl shadow-sm border mb-3 sm:mb-4 p-2 sm:p-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                                    <input
                                        ref={searchInputRef}
                                        type="text"
                                        inputMode="text"
                                        autoComplete="off"
                                        autoCorrect="off"
                                        autoCapitalize="off"
                                        spellCheck="false"
                                        placeholder="Buscar producto..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => setIsSearchFocused(true)}
                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 500)}
                                        className="w-full pl-9 sm:pl-10 pr-8 py-2 sm:py-2.5 rounded-lg border-gray-300 focus:border-orange-500 focus:ring-orange-500 text-sm sm:text-base"
                                    />
                                    {searchQuery && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery('');
                                                searchInputRef.current?.focus();
                                            }}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                {searchQuery && (
                                    <p className="text-xs text-gray-500 mt-2">
                                        {filteredItems.length} producto{filteredItems.length !== 1 ? 's' : ''} encontrado{filteredItems.length !== 1 ? 's' : ''}
                                    </p>
                                )}
                            </div>

                            {/* Category Tabs - Hidden when searching */}
                            {!searchQuery && (
                                <div className="bg-white rounded-xl shadow-sm border mb-3 sm:mb-4 p-1.5 sm:p-2 flex gap-1.5 sm:gap-2 overflow-x-auto scrollbar-hide">
                                    {menu.categorias.map(cat => (
                                        <button
                                            key={cat.nombre}
                                            onClick={() => setActiveCategory(cat.nombre)}
                                            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                                                activeCategory === cat.nombre
                                                    ? 'bg-orange-500 text-white'
                                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-gray-300'
                                            }`}
                                        >
                                            {cat.nombre}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Menu Items */}
                            <div className="bg-white rounded-xl shadow-sm border p-2 sm:p-4">
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                                    {filteredItems.map((item, idx) => {
                                        const hasVariants = PRODUCT_VARIANTS[item.nombre.toUpperCase()];
                                        const hasEggs = BREAKFAST_PRODUCTS_WITH_EGGS.includes(item.nombre.toUpperCase());
                                        return (
                                            <div
                                                key={idx}
                                                className={`border rounded-xl p-2 sm:p-4 hover:border-orange-300 hover:bg-orange-50 transition-colors active:scale-95 relative ${
                                                    hasVariants || hasEggs ? 'border-l-4 border-l-orange-400' : ''
                                                }`}
                                            >
                                                {(hasVariants || hasEggs) && (
                                                    <div className="absolute top-1 right-1">
                                                        <Settings2 className="h-3 w-3 text-orange-400" />
                                                    </div>
                                                )}
                                                <div className="flex justify-between items-start mb-1 sm:mb-2">
                                                    <div className="min-w-0 flex-1">
                                                        <h3 className="font-medium text-gray-800 text-xs sm:text-base truncate">{item.nombre}</h3>
                                                        <div className="flex items-center gap-1">
                                                            <p className="text-sm sm:text-lg font-bold text-orange-600">{currency}{item.precio.toLocaleString('es-CR')}</p>
                                                            {item.tax_type === 'exento' && (
                                                                <span className="text-[10px] sm:text-xs text-gray-400">(ex)</span>
                                                            )}
                                                        </div>
                                                        {searchQuery && item.category && (
                                                            <span className="text-[10px] text-gray-400">{item.category}</span>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => addToCart(item, item.category || activeCategory)}
                                                        className="p-1.5 sm:p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex-shrink-0 active:scale-95"
                                                    >
                                                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                                                    </button>
                                                </div>
                                                
                                                {/* Quick notes toggle - Hidden on mobile for simplicity */}
                                                <button
                                                    onClick={() => setShowNotesFor(showNotesFor === item.nombre ? null : item.nombre)}
                                                    className="hidden sm:flex text-xs text-gray-500 hover:text-orange-500 items-center"
                                                >
                                                    <MessageSquare className="h-3 w-3 mr-1" />
                                                    {itemNotes[item.nombre] ? 'Editar nota' : 'Agregar nota'}
                                                </button>
                                                
                                                {showNotesFor === item.nombre && (
                                                    <input
                                                        type="text"
                                                        inputMode="text"
                                                        autoComplete="off"
                                                        placeholder="Ej: sin cebolla, extra picante..."
                                                        value={itemNotes[item.nombre] || ''}
                                                        onChange={(e) => setItemNotes({...itemNotes, [item.nombre]: e.target.value})}
                                                        onFocus={() => setIsSearchFocused(true)}
                                                        onBlur={() => setTimeout(() => setIsSearchFocused(false), 500)}
                                                        className="mt-2 w-full text-sm rounded-lg border-gray-300"
                                                        autoFocus
                                                    />
                                                )}
                                            </div>
                                        );
                                    })}
                                    {filteredItems.length === 0 && (
                                        <div className="col-span-full text-center py-8 text-gray-400">
                                            <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                            <p>No se encontraron productos</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Cart Section - Fixed bottom on mobile, sidebar on desktop */}
                        <div className="w-full lg:w-96 order-1 lg:order-2">
                            <div className="bg-white rounded-xl shadow-sm border lg:sticky lg:top-20">
                                <div className="p-3 sm:p-4 border-b bg-orange-50 rounded-t-xl">
                                    <h3 className="font-bold text-base sm:text-lg flex items-center text-orange-700">
                                        <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                                        Pedido ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                                    </h3>
                                </div>

                                <div className="p-2 sm:p-4 max-h-[200px] sm:max-h-[400px] overflow-y-auto">
                                    {cart.length === 0 ? (
                                        <p className="text-gray-400 text-center py-4 sm:py-8 text-sm">
                                            Agrega productos
                                        </p>
                                    ) : (
                                        <div className="space-y-2 sm:space-y-3">
                                            {cart.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            {item.product_name}
                                                            {item.tax_type === 'exento' && <span className="text-xs text-gray-400 ml-1">(exento)</span>}
                                                        </p>
                                                        {item.notes && (
                                                            <p className="text-xs text-gray-500 italic">→ {item.notes}</p>
                                                        )}
                                                        <p className="text-orange-600 font-bold">{currency}{(item.price * item.quantity).toLocaleString('es-CR')}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            onClick={() => updateQuantity(idx, -1)}
                                                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            <Minus className="h-4 w-4" />
                                                        </button>
                                                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(idx, 1)}
                                                            className="p-1 bg-gray-200 rounded hover:bg-gray-300"
                                                        >
                                                            <Plus className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => removeFromCart(idx)}
                                                            className="p-1 text-red-500 hover:bg-red-100 rounded ml-1"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {cart.length > 0 && (
                                    <>
                                        {/* Order Notes */}
                                        <div className="px-4 pb-3">
                                            <label className="text-xs text-gray-500">Notas del pedido</label>
                                            <textarea
                                                value={orderNotes}
                                                onChange={(e) => setOrderNotes(e.target.value)}
                                                placeholder="Instrucciones especiales..."
                                                className="w-full mt-1 text-sm rounded-lg border-gray-300"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Para Llevar Toggle */}
                                        <div className="px-4 pb-3">
                                            <label 
                                                className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                                                    isTakeout 
                                                        ? 'border-orange-500 bg-orange-50' 
                                                        : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                                onClick={() => setIsTakeout(!isTakeout)}
                                            >
                                                <Package className={`h-5 w-5 ${isTakeout ? 'text-orange-500' : 'text-gray-400'}`} />
                                                <div className="flex-1">
                                                    <span className={`font-medium ${isTakeout ? 'text-orange-700' : 'text-gray-700'}`}>
                                                        Para Llevar
                                                    </span>
                                                    <p className="text-xs text-gray-500">No se cobra el 10% de servicio</p>
                                                </div>
                                                <div className={`w-10 h-6 rounded-full transition-colors ${
                                                    isTakeout ? 'bg-orange-500' : 'bg-gray-300'
                                                }`}>
                                                    <div className={`w-5 h-5 mt-0.5 bg-white rounded-full shadow transform transition-transform ${
                                                        isTakeout ? 'translate-x-4.5 ml-0.5' : 'translate-x-0.5'
                                                    }`} />
                                                </div>
                                            </label>
                                        </div>

                                        {/* Totals */}
                                        <div className="px-4 pb-4 space-y-2 border-t pt-4">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span>{currency}{getSubtotal().toLocaleString('es-CR', { minimumFractionDigits: 0 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">IVA ({ivaRate}%)</span>
                                                <span>{currency}{getTax().toLocaleString('es-CR', { minimumFractionDigits: 0 })}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className={`${isTakeout ? 'text-gray-400 line-through' : 'text-gray-500'}`}>
                                                    Servicio ({serviceRate}%)
                                                    {isTakeout && <span className="text-xs ml-1 no-underline text-orange-500">(Para llevar)</span>}
                                                </span>
                                                <span className={isTakeout ? 'text-gray-400' : ''}>
                                                    {currency}{getService().toLocaleString('es-CR', { minimumFractionDigits: 0 })}
                                                </span>
                                            </div>
                                            <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                                <span>Total</span>
                                                <span className="text-orange-600">{currency}{getTotal().toLocaleString('es-CR', { minimumFractionDigits: 0 })}</span>
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <div className="p-4 border-t">
                                            <button
                                                onClick={handleSubmit}
                                                disabled={isSubmitting || cart.length === 0}
                                                className={`w-full py-3 rounded-xl font-bold transition-colors flex items-center justify-center ${
                                                    isSubmitting || cart.length === 0
                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                        : 'bg-green-500 text-white hover:bg-green-600'
                                                }`}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                        Enviando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Send className="h-5 w-5 mr-2" />
                                                        Enviar a Cocina
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de selección de tipo de huevo */}
            {eggModal.show && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-4 bg-orange-50 border-b">
                            <h3 className="text-lg font-bold text-orange-700 flex items-center">
                                <Egg className="h-5 w-5 mr-2" />
                                ¿Cómo prefiere los huevos?
                            </h3>
                            <p className="text-sm text-orange-600 mt-1">{eggModal.item?.nombre}</p>
                        </div>
                        
                        <div className="p-4 space-y-3">
                            <button
                                onClick={() => handleEggSelection('Fritos')}
                                className="w-full py-4 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3 active:scale-95"
                            >
                                🍳 Huevos Fritos
                            </button>
                            
                            <button
                                onClick={() => handleEggSelection('Revueltos')}
                                className="w-full py-4 px-4 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-3 active:scale-95"
                            >
                                🥚 Huevos Revueltos
                            </button>
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t">
                            <button
                                onClick={() => setEggModal({ show: false, item: null, category: null })}
                                className="w-full py-2 text-gray-600 hover:text-gray-800 font-medium"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de selección de variantes */}
            {variantModal.show && variantModal.config && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
                        <div className="p-4 bg-orange-50 border-b flex-shrink-0">
                            <h3 className="text-lg font-bold text-orange-700 flex items-center">
                                <span className="text-2xl mr-2">{variantModal.config.icon}</span>
                                {variantModal.config.title}
                            </h3>
                            <p className="text-sm text-orange-600 mt-1">{variantModal.item?.nombre}</p>
                        </div>
                        
                        <div className="p-4 space-y-4 overflow-y-auto flex-grow">
                            {variantModal.config.options.map((optionGroup, groupIndex) => (
                                <div key={groupIndex} className="space-y-2">
                                    <h4 className="font-semibold text-gray-700 flex items-center gap-2">
                                        {optionGroup.group}
                                        {optionGroup.required && (
                                            <span className="text-xs text-red-500 font-normal">*Requerido</span>
                                        )}
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {optionGroup.choices.map((choice, choiceIndex) => {
                                            const isSelected = (variantSelections[groupIndex] || []).includes(choice.value);
                                            return (
                                                <button
                                                    key={choiceIndex}
                                                    onClick={() => handleVariantToggle(groupIndex, choice.value, optionGroup.single)}
                                                    className={`w-full py-3 px-4 rounded-xl font-medium text-left transition-all flex items-center gap-3 active:scale-98 ${
                                                        isSelected
                                                            ? 'bg-orange-500 text-white shadow-lg ring-2 ring-orange-300'
                                                            : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                    }`}
                                                >
                                                    <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                                        isSelected 
                                                            ? 'border-white bg-white' 
                                                            : 'border-gray-400'
                                                    }`}>
                                                        {isSelected && (
                                                            <Check className={`h-3 w-3 ${isSelected ? 'text-orange-500' : 'text-gray-400'}`} />
                                                        )}
                                                    </span>
                                                    <span className="text-lg">{choice.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="p-4 bg-gray-50 border-t flex gap-3 flex-shrink-0">
                            <button
                                onClick={handleVariantCancel}
                                className="flex-1 py-3 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleVariantConfirm}
                                className="flex-1 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="h-4 w-4" />
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
