"use client";

import {
    forwardRef,
    useRef,
    useState,
    type ButtonHTMLAttributes,
    type PointerEvent,
    type ReactNode,
} from "react";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    ArrowDownToLine,
    ArrowRight,
    ArrowUpToLine,
    Check,
    Circle,
    Copy,
    Diamond,
    Droplet,
    Ellipsis,
    GripVertical,
    ImageIcon,
    Layers,
    Lock,
    Minus,
    Palette,
    Pencil,
    Square,
    Trash2,
    Type,
    Unlock,
    X,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type ElementType =
    | "rectangle"
    | "ellipse"
    | "diamond"
    | "text"
    | "line"
    | "arrow"
    | "freedraw"
    | "image"
    | string;

type SelectedElement = {
    type: ElementType;
    strokeColor?: string;
    backgroundColor?: string;
    textAlign?: "left" | "center" | "right";
    strokeWidth?: number;
    strokeStyle?: "solid" | "dashed" | "dotted";
    fontFamily?: number;
    fontSize?: number;
    opacity?: number;
    roughness?: number;
    locked?: boolean;
};

type PropertyChange = (property: string, value: unknown) => void;

type Props = {
    selectedElement: SelectedElement | null;
    position: { left: number; top: number };
    onDelete?: () => void;
    onDuplicate?: () => void;
    onLock?: () => void;
    onBringToFront?: () => void;
    onSendToBack?: () => void;
    onPropertyChange?: PropertyChange;
};

type OptionsProps = Pick<
    Props,
    "selectedElement" | "onPropertyChange" | "onBringToFront" | "onSendToBack"
> & { selectedElement: SelectedElement };

const COLORS = ["#1e1e1e", "#e03131", "#f08c00", "#2f9e44", "#1971c2", "#7048e8"];
const STROKE_WIDTHS = [1, 2, 4] as const;
const FONT_SIZES = [12, 16, 20, 24, 32, 40, 48, 64] as const;
const POPOVER_CLASS = "z-[9999] rounded-xl border border-slate-200 p-2.5 shadow-xl";
const SELECT_CLASS =
    "mt-1 h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs outline-none focus:border-blue-400";

export default function FloatingProperties({
    selectedElement,
    position,
    onDelete,
    onDuplicate,
    onLock,
    onBringToFront,
    onSendToBack,
    onPropertyChange,
}: Props) {
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [moreOpen, setMoreOpen] = useState(false);
    const dragStart = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });

    if (!selectedElement) return null;

    const type = selectedElement.type;
    const isText = type === "text";
    const isShape = ["rectangle", "ellipse", "diamond"].includes(type);
    const isLine = type === "line";
    const isArrow = type === "arrow";
    const isLinear = isLine || isArrow;
    const isFreeDraw = type === "freedraw";
    const isImage = type === "image";
    const optionProps: OptionsProps = {
        selectedElement,
        onPropertyChange,
        onBringToFront,
        onSendToBack,
    };

    const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.setPointerCapture(event.pointerId);
        dragStart.current = {
            mouseX: event.clientX,
            mouseY: event.clientY,
            offsetX: dragOffset.x,
            offsetY: dragOffset.y,
        };
    };

    const drag = (event: PointerEvent<HTMLButtonElement>) => {
        if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
        setDragOffset({
            x: dragStart.current.offsetX + event.clientX - dragStart.current.mouseX,
            y: dragStart.current.offsetY + event.clientY - dragStart.current.mouseY,
        });
    };

    const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
    };

    const TOOLBAR_OFFSET_Y = 80;
    return (
        <div
            className="absolute z-[500] flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-2xl border border-slate-200 bg-white/95 p-1 shadow-[0_12px_35px_rgba(15,23,42,0.14)] backdrop-blur-xl"
            style={{ left: position.left + dragOffset.x, top: position.top + dragOffset.y + TOOLBAR_OFFSET_Y }}
        >
            <button
                type="button"
                aria-label="Move toolbar"
                className="flex h-9 w-7 touch-none cursor-grab items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing"
                onPointerDown={startDrag}
                onPointerMove={drag}
                onPointerUp={endDrag}
                onPointerCancel={endDrag}
            >
                <GripVertical size={16} />
            </button>

            <ToolbarDivider />
            <ToolbarButton title="Element" active><ElementIcon type={type} /></ToolbarButton>

            {!isImage && (
                <ColorPopover
                    title={isText ? "Text color" : "Stroke color"}
                    icon={<Palette size={18} />}
                    color={selectedElement.strokeColor ?? COLORS[0]}
                    activeColor={selectedElement.strokeColor}
                    onSelect={(color) => onPropertyChange?.("strokeColor", color)}
                />
            )}

            {isShape && (
                <FillPopover
                    color={selectedElement.backgroundColor}
                    onSelect={(color) => onPropertyChange?.("backgroundColor", color)}
                />
            )}

            {isText && <AlignmentPopover element={selectedElement} onChange={onPropertyChange} />}
            {(isLinear || isFreeDraw) && <WidthPopover element={selectedElement} onChange={onPropertyChange} />}

            <ToolbarDivider />
            <ToolbarButton title="Duplicate" onClick={onDuplicate}><Copy size={18} /></ToolbarButton>
            <ToolbarButton title={selectedElement.locked ? "Unlock" : "Lock"} onClick={onLock}>
                {selectedElement.locked ? <Unlock size={18} /> : <Lock size={18} />}
            </ToolbarButton>
            <ToolbarButton title="Delete" danger onClick={onDelete}><Trash2 size={18} /></ToolbarButton>

            <ToolbarDivider />
            <Popover open={moreOpen} onOpenChange={setMoreOpen}>
                <PopoverTrigger
                    render={<ToolbarButton title="More options" active={moreOpen}><Ellipsis size={19} /></ToolbarButton>}
                />
                <PopoverContent
                    side="bottom"
                    align="end"
                    sideOffset={8}
                    className="z-[9999] w-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 shadow-[0_18px_50px_rgba(15,23,42,0.18)]"
                >
                    <div className="flex h-9 items-center justify-between px-2.5">
                        <span className="text-[13px] font-semibold text-slate-900">{getOptionsTitle(type)}</span>
                        <button type="button" aria-label="Close options" onClick={() => setMoreOpen(false)} className="flex h-6 w-6 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900">
                            <X size={14} />
                        </button>
                    </div>
                    <SectionDivider />
                    {isText && <TextOptions {...optionProps} />}
                    {isShape && <ShapeOptions {...optionProps} />}
                    {(isLinear || isFreeDraw) && <LinearOptions {...optionProps} />}
                    {isImage && <ImageOptions {...optionProps} />}
                </PopoverContent>
            </Popover>
        </div>
    );
}

function ColorPopover({ title, icon, color, activeColor, onSelect }: { title: string; icon: ReactNode; color: string; activeColor?: string; onSelect: (color: string) => void }) {
    return <Popover><PopoverTrigger render={<ToolbarButton title={title}><ColorIcon icon={icon} color={color} /></ToolbarButton>} /><PopoverContent side="bottom" align="center" sideOffset={8} className={`${POPOVER_CLASS} w-[220px]`}><PropertyLabel>{title}</PropertyLabel><ColorGrid activeColor={activeColor} onSelect={onSelect} /></PopoverContent></Popover>;
}

function FillPopover({ color, onSelect }: { color?: string; onSelect: (color: string) => void }) {
    const displayedColor = !color || color === "transparent" ? "#ffffff" : color;
    return <Popover><PopoverTrigger render={<ToolbarButton title="Fill color"><ColorIcon icon={<Droplet size={18} />} color={displayedColor} bordered /></ToolbarButton>} /><PopoverContent side="bottom" align="center" sideOffset={8} className={`${POPOVER_CLASS} w-[220px]`}><PropertyLabel>Fill color</PropertyLabel><div className="mt-2 grid grid-cols-6 gap-1.5">{COLORS.map((value) => <ColorSquare key={value} color={value} active={color === value} onClick={() => onSelect(value)} />)}</div><button type="button" onClick={() => onSelect("transparent")} className="mt-2 flex h-8 w-full items-center justify-center rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50">No fill</button></PopoverContent></Popover>;
}

function AlignmentPopover({ element, onChange }: { element: SelectedElement; onChange?: PropertyChange }) {
    const align = element.textAlign ?? "left";
    const currentIcon = align === "center" ? <AlignCenter size={18} /> : align === "right" ? <AlignRight size={18} /> : <AlignLeft size={18} />;
    return <Popover><PopoverTrigger render={<ToolbarButton title="Alignment">{currentIcon}</ToolbarButton>} /><PopoverContent side="bottom" align="center" sideOffset={8} className="z-[9999] w-auto rounded-xl p-1 shadow-xl"><AlignmentButtons value={align} onChange={(value) => onChange?.("textAlign", value)} compact /></PopoverContent></Popover>;
}

function WidthPopover({ element, onChange }: { element: SelectedElement; onChange?: PropertyChange }) {
    return <Popover><PopoverTrigger render={<ToolbarButton title="Stroke width"><Minus size={19} strokeWidth={2.5} /></ToolbarButton>} /><PopoverContent side="bottom" align="center" sideOffset={8} className="z-[9999] w-[170px] rounded-xl p-2 shadow-xl"><PropertyLabel>Stroke width</PropertyLabel><div className="mt-2 grid grid-cols-3 gap-1">{STROKE_WIDTHS.map((width) => <button key={width} type="button" onClick={() => onChange?.("strokeWidth", width)} className={`flex h-8 items-center justify-center rounded-lg border ${element.strokeWidth === width ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}><span className="w-7 rounded-full bg-slate-700" style={{ height: width }} /></button>)}</div></PopoverContent></Popover>;
}

function TextOptions({ selectedElement, onPropertyChange, onBringToFront, onSendToBack }: OptionsProps) {
    return <><ArrangeActions onBringToFront={onBringToFront} onSendToBack={onSendToBack} /><SectionDivider /><div className="px-2.5 py-2"><PropertyLabel>Font</PropertyLabel><div className="mt-1.5 grid grid-cols-3 gap-1">{[[1, "Hand"], [2, "Normal"], [3, "Mono"]].map(([value, label]) => <TextOptionButton key={value} active={(selectedElement.fontFamily ?? 1) === value} onClick={() => onPropertyChange?.("fontFamily", value)}>{label}</TextOptionButton>)}</div></div><SectionDivider /><div className="grid grid-cols-[85px_1fr] gap-2 px-2.5 py-2"><div><PropertyLabel>Size</PropertyLabel><select value={selectedElement.fontSize ?? 20} onChange={(event) => onPropertyChange?.("fontSize", Number(event.target.value))} className={SELECT_CLASS}>{FONT_SIZES.map((size) => <option key={size} value={size}>{size} px</option>)}</select></div><div><PropertyLabel>Alignment</PropertyLabel><div className="mt-1"><AlignmentButtons value={selectedElement.textAlign ?? "left"} onChange={(value) => onPropertyChange?.("textAlign", value)} /></div></div></div><SectionDivider /><div className="px-2.5 py-2"><PropertyLabel>Text color</PropertyLabel><ColorRow activeColor={selectedElement.strokeColor} onSelect={(color) => onPropertyChange?.("strokeColor", color)} /></div><SectionDivider /><OpacityControl element={selectedElement} onChange={onPropertyChange} /></>;
}

function ShapeOptions({ selectedElement, onPropertyChange, onBringToFront, onSendToBack }: OptionsProps) {
    return <><ArrangeActions onBringToFront={onBringToFront} onSendToBack={onSendToBack} /><SectionDivider /><div className="px-2.5 py-2"><div className="flex items-center justify-between"><PropertyLabel>Stroke</PropertyLabel><span className="text-[10px] text-slate-400">Style & width</span></div><StrokeControls element={selectedElement} onChange={onPropertyChange} /></div><SectionDivider /><div className="px-2.5 py-2"><PropertyLabel>Fill</PropertyLabel><div className="mt-1.5 flex items-center gap-1">{COLORS.map((color) => <ColorSquare key={color} color={color} active={selectedElement.backgroundColor === color} onClick={() => onPropertyChange?.("backgroundColor", color)} />)}<button type="button" title="No fill" onClick={() => onPropertyChange?.("backgroundColor", "transparent")} className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50"><X size={13} /></button></div></div><SectionDivider /><OpacityControl element={selectedElement} onChange={onPropertyChange} /></>;
}

function LinearOptions({ selectedElement, onPropertyChange, onBringToFront, onSendToBack }: OptionsProps) {
    return <><ArrangeActions onBringToFront={onBringToFront} onSendToBack={onSendToBack} /><SectionDivider /><div className="px-2.5 py-2"><PropertyLabel>Stroke</PropertyLabel><StrokeControls element={selectedElement} onChange={onPropertyChange} /></div><SectionDivider /><div className="px-2.5 py-2"><PropertyLabel>Color</PropertyLabel><ColorRow activeColor={selectedElement.strokeColor} onSelect={(color) => onPropertyChange?.("strokeColor", color)} /></div><SectionDivider /><OpacityControl element={selectedElement} onChange={onPropertyChange} /></>;
}

function ImageOptions({ selectedElement, onPropertyChange, onBringToFront, onSendToBack }: OptionsProps) {
    return <><ArrangeActions onBringToFront={onBringToFront} onSendToBack={onSendToBack} /><SectionDivider /><OpacityControl element={selectedElement} onChange={onPropertyChange} /></>;
}

function ArrangeActions({ onBringToFront, onSendToBack }: Pick<Props, "onBringToFront" | "onSendToBack">) {
    return <div className="p-1.5"><div className="grid grid-cols-2 gap-1"><QuickAction icon={<ArrowUpToLine size={16} />} label="Bring front" onClick={onBringToFront} /><QuickAction icon={<ArrowDownToLine size={16} />} label="Send back" onClick={onSendToBack} /></div></div>;
}

function StrokeControls({ element, onChange }: { element: SelectedElement; onChange?: PropertyChange }) {
    const isSharp = (element.roughness ?? 1) === 0;
    return <><div className="mt-1.5 grid grid-cols-3 gap-1">{(["solid", "dashed", "dotted"] as const).map((style) => <StrokeStyleButton key={style} styleType={style} selected={(element.strokeStyle ?? "solid") === style} onClick={() => onChange?.("strokeStyle", style)} />)}</div><select value={element.strokeWidth ?? 1} onChange={(event) => onChange?.("strokeWidth", Number(event.target.value))} className={`${SELECT_CLASS} mt-1.5`}>{STROKE_WIDTHS.map((width) => <option key={width} value={width}>{width} px — {width === 1 ? "Thin" : width === 2 ? "Medium" : "Thick"}</option>)}</select><div className="mt-1.5 grid grid-cols-2 gap-1"><ModeButton active={isSharp} onClick={() => onChange?.("shapeMode", "sharp")}>Sharp</ModeButton><ModeButton active={!isSharp} onClick={() => onChange?.("shapeMode", "drawn")}>Hand drawn</ModeButton></div></>;
}

function OpacityControl({ element, onChange }: { element: SelectedElement; onChange?: PropertyChange }) {
    const opacity = element.opacity ?? 100;
    return <div className="px-2.5 py-2"><div className="flex items-center justify-between"><PropertyLabel>Opacity</PropertyLabel><span className="text-[10px] font-medium text-slate-400">{opacity}%</span></div><input type="range" min={0} max={100} value={opacity} onChange={(event) => onChange?.("opacity", Number(event.target.value))} className="mt-1 block h-4 w-full cursor-pointer accent-blue-600" /></div>;
}

function AlignmentButtons({ value, onChange, compact = false }: { value: "left" | "center" | "right"; onChange: (value: "left" | "center" | "right") => void; compact?: boolean }) {
    const Button = compact ? MiniButton : TextIconButton;
    return <div className="flex gap-0.5">{([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([alignment, Icon]) => <Button key={alignment} active={value === alignment} onClick={() => onChange(alignment)}><Icon size={compact ? 17 : 16} /></Button>)}</div>;
}

function ColorGrid({ activeColor, onSelect }: { activeColor?: string; onSelect: (color: string) => void }) { return <div className="mt-2 grid grid-cols-6 gap-1.5">{COLORS.map((color) => <ColorCircle key={color} color={color} active={activeColor === color} onClick={() => onSelect(color)} />)}</div>; }
function ColorRow({ activeColor, onSelect }: { activeColor?: string; onSelect: (color: string) => void }) { return <div className="mt-1.5 flex items-center gap-1">{COLORS.map((color) => <ColorCircle key={color} color={color} active={activeColor === color} onClick={() => onSelect(color)} />)}</div>; }
function ColorIcon({ icon, color, bordered = false }: { icon: ReactNode; color: string; bordered?: boolean }) { return <div className="relative">{icon}<span className={`absolute -bottom-[4px] left-1/2 h-[3px] w-4 -translate-x-1/2 rounded-full ${bordered ? "border border-slate-200" : ""}`} style={{ backgroundColor: color }} /></div>; }
function ElementIcon({ type }: { type: ElementType }) { const icons: Record<string, ReactNode> = { rectangle: <Square size={18} />, ellipse: <Circle size={18} />, diamond: <Diamond size={18} />, text: <Type size={18} />, line: <Minus size={18} />, arrow: <ArrowRight size={18} />, freedraw: <Pencil size={18} />, image: <ImageIcon size={18} /> }; return icons[type] ?? <Layers size={18} />; }
function getOptionsTitle(type: ElementType) { if (type === "text") return "Text options"; if (["rectangle", "ellipse", "diamond"].includes(type)) return "Shape options"; if (["line", "arrow"].includes(type)) return "Line options"; if (type === "freedraw") return "Drawing options"; if (type === "image") return "Image options"; return "More options"; }

type ToolbarButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    active?: boolean;
    danger?: boolean;
};

const ToolbarButton = forwardRef<HTMLButtonElement, ToolbarButtonProps>(
    ({ children, active = false, danger = false, className, ...props }, ref) => (
        <button
            ref={ref}
            type="button"
            {...props}
            className={`flex h-9 w-9 items-center justify-center rounded-lg transition-all duration-150 ${danger ? "text-red-500 hover:bg-red-50 hover:text-red-600" : active ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"} ${className ?? ""}`}
        >
            {children}
        </button>
    ),
);

ToolbarButton.displayName = "ToolbarButton";
function QuickAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick?: () => void }) { return <button type="button" onClick={onClick} className="flex h-10 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2 text-[10px] font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900">{icon}<span className="truncate">{label}</span></button>; }
function TextOptionButton({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) { return <button type="button" onClick={onClick} className={`flex h-8 items-center justify-center rounded-lg border text-[11px] font-medium transition ${active ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>; }
function TextIconButton({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) { return <button type="button" onClick={onClick} className={`flex h-8 flex-1 items-center justify-center rounded-lg border transition ${active ? "border-blue-300 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}>{children}</button>; }
function MiniButton({ children, active = false, onClick }: { children: ReactNode; active?: boolean; onClick?: () => void }) { return <button type="button" onClick={onClick} className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${active ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-100"}`}>{children}</button>; }
function ColorCircle({ color, active, onClick }: { color: string; active?: boolean; onClick?: () => void }) { return <button type="button" aria-label={`Select ${color}`} onClick={onClick} className="relative flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 transition hover:scale-110" style={{ backgroundColor: color }}>{active && <Check size={12} className="text-white" />}</button>; }
function ColorSquare({ color, active, onClick }: { color: string; active?: boolean; onClick?: () => void }) { return <button type="button" aria-label={`Select ${color}`} onClick={onClick} className={`relative flex h-7 w-7 items-center justify-center rounded-md border transition hover:scale-110 ${active ? "border-blue-400 ring-1 ring-blue-200" : "border-slate-200"}`} style={{ backgroundColor: color }}>{active && <Check size={12} className="text-white" />}</button>; }
function StrokeStyleButton({ styleType, selected, onClick }: { styleType: "solid" | "dashed" | "dotted"; selected?: boolean; onClick?: () => void }) { return <button type="button" aria-label={`${styleType} stroke`} onClick={onClick} className={`flex h-8 items-center justify-center rounded-lg border transition ${selected ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:bg-slate-50"}`}><div className={`w-8 border-t-2 border-slate-600 ${styleType === "solid" ? "border-solid" : styleType === "dashed" ? "border-dashed" : "border-dotted"}`} /></button>; }
function ModeButton({ children, active, onClick }: { children: ReactNode; active: boolean; onClick: () => void }) { return <button type="button" onClick={onClick} className={`flex h-8 items-center justify-center rounded-lg border text-xs font-medium transition ${active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"}`}>{children}</button>; }
function PropertyLabel({ children }: { children: ReactNode }) { return <span className="text-[11px] font-semibold text-slate-500">{children}</span>; }
function ToolbarDivider() { return <div className="mx-0.5 h-6 w-px bg-slate-200" />; }
function SectionDivider() { return <div className="h-px bg-slate-100" />; }
