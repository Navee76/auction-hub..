import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AuctionCondition } from '../../types';
import { SafeImage } from '../common/SafeImage';
import {
  Package,
  DollarSign,
  Calendar,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

const PRESET_SAMPLE_IMAGES = [
  {
    label: 'Vintage Watch',
    url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Modern Laptop',
    url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Classic Car',
    url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Fine Oil Painting',
    url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Porcelain Antique',
    url: 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=900&q=80',
  },
  {
    label: 'Luxury Residence',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80',
  },
];

export const CreateAuctionPage: React.FC = () => {
  const {
    currentUser,
    categories,
    createAuction,
    openAuctionDetail,
    openAuthModal,
    addToast,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Product Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'Art & Collectibles');
  const [condition, setCondition] = useState<AuctionCondition>('Like New');
  const [imageUrl, setImageUrl] = useState(PRESET_SAMPLE_IMAGES[0].url);

  // Step 2: Pricing
  const [startingPrice, setStartingPrice] = useState<number>(500);
  const [minIncrement, setMinIncrement] = useState<number>(50);
  const [hasReserve, setHasReserve] = useState(false);
  const [reservePrice, setReservePrice] = useState<number>(800);

  // Step 3: Schedule
  const now = new Date();
  const formatDateTimeInput = (d: Date) => d.toISOString().slice(0, 16);

  const [startTime, setStartTime] = useState<string>(formatDateTimeInput(now));
  const [endTime, setEndTime] = useState<string>(
    formatDateTimeInput(new Date(now.getTime() + 3 * 24 * 3600 * 1000))
  );

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const applyDurationPreset = (hours: number) => {
    const s = new Date(startTime);
    const e = new Date(s.getTime() + hours * 3600 * 1000);
    setEndTime(formatDateTimeInput(e));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        addToast('success', 'Image Uploaded', 'Custom image loaded with preview.');
      };
      reader.readAsDataURL(file);
    }
  };

  const validateStep1 = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'Product title is required.';
    if (!description.trim()) errs.description = 'Description is required (at least 20 characters).';
    else if (description.trim().length < 20) errs.description = 'Please provide a more detailed description.';
    if (!imageUrl.trim()) errs.imageUrl = 'Product image is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: { [key: string]: string } = {};
    if (startingPrice <= 0) errs.startingPrice = 'Starting price must be greater than $0.';
    if (minIncrement <= 0) errs.minIncrement = 'Minimum increment must be at least $1.';
    if (hasReserve && reservePrice < startingPrice) {
      errs.reservePrice = 'Reserve price cannot be less than starting price.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep3 = () => {
    const errs: { [key: string]: string } = {};
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    if (isNaN(startMs)) errs.startTime = 'Valid start date is required.';
    if (isNaN(endMs)) errs.endTime = 'Valid end date is required.';
    if (endMs <= startMs) errs.endTime = 'End time must be after start time.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const nextStep = () => {
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    if (currentStep === 3 && !validateStep3()) return;
    setCurrentStep((prev) => (prev < 4 ? ((prev + 1) as 1 | 2 | 3 | 4) : prev));
  };

  const prevStep = () => {
    setCurrentStep((prev) => (prev > 1 ? ((prev - 1) as 1 | 2 | 3 | 4) : prev));
  };

  const handlePublish = () => {
    if (!currentUser) {
      openAuthModal('login');
      return;
    }

    if (!validateStep1() || !validateStep2() || !validateStep3()) {
      addToast('error', 'Validation Failed', 'Please review previous steps.');
      return;
    }

    const newAuctionId = createAuction({
      title: title.trim(),
      description: description.trim(),
      category,
      imageUrl,
      condition,
      startingPrice,
      minIncrement,
      reservePrice: hasReserve ? reservePrice : undefined,
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      sellerEmail: currentUser.email,
      sellerRating: 5.0,
      sellerMemberSince: currentUser.memberSince,
    });

    openAuctionDetail(newAuctionId);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Create New Auction Listing
        </h1>
        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complete the 4-step wizard to list your valuable item on the AuctionHub marketplace.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          { step: 1, label: 'Product Info', icon: Package },
          { step: 2, label: 'Pricing', icon: DollarSign },
          { step: 3, label: 'Schedule', icon: Calendar },
          { step: 4, label: 'Review & Publish', icon: CheckCircle2 },
        ].map((s) => {
          const Icon = s.icon;
          const isDone = currentStep > s.step;
          const isCurrent = currentStep === s.step;

          return (
            <div
              key={s.step}
              className={`flex items-center gap-2 p-2.5 sm:p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? 'border-[#7C3AED] bg-purple-50 dark:bg-purple-950/40 text-[#7C3AED] dark:text-purple-300 shadow-xs'
                  : isDone
                  ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  isCurrent
                    ? 'bg-[#7C3AED] text-white'
                    : isDone
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {isDone ? '✓' : s.step}
              </div>
              <div className="hidden sm:block truncate">
                <span className="text-[10px] uppercase font-bold block leading-none">Step {s.step}</span>
                <span className="text-xs font-semibold truncate block mt-0.5">{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Forms */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
        
        {/* STEP 1: PRODUCT INFORMATION */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              <span>Step 1: Product Information</span>
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Product Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 1972 Vintage Diver Automatic Watch - Original Dial"
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
              />
              {errors.title && <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Condition *
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as AuctionCondition)}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                >
                  <option value="New">New (Unopened / Mint)</option>
                  <option value="Like New">Like New (Flawless with original packaging)</option>
                  <option value="Good">Good (Minor normal wear, fully functional)</option>
                  <option value="Used">Used (Vintage patina / authentic character)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                Detailed Description *
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include key details such as provenance, materials, dimensions, manufacturer, historic background, serial numbers, and physical condition..."
                className="w-full px-4 py-2.5 text-xs md:text-sm bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
              />
              {errors.description && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.description}</p>
              )}
            </div>

            {/* Image Upload and Selection */}
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200">
                Product Image & Live Preview *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                <div className="md:col-span-4 aspect-4/3 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 relative shadow-xs">
                  <SafeImage src={imageUrl} alt="Preview" fallbackCategory={category} className="w-full h-full" />
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Upload Local Image File:</span>
                    <label className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer w-fit transition-colors">
                      <Upload className="w-4 h-4 text-purple-600" />
                      <span>Choose File from Device</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Or choose a high-res sample lot:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_SAMPLE_IMAGES.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className={`px-2.5 py-1 text-xs rounded-lg border transition-colors ${
                            imageUrl === preset.url
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-500 block mb-1">Or custom Image URL:</span>
                    <input
                      type="url"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://images.example.com/item.jpg"
                      className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PRICING */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-purple-600" />
              <span>Step 2: Pricing Strategy & Reserve</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Starting Price (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    value={startingPrice}
                    onChange={(e) => setStartingPrice(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Initial lowest bid amount for opening the auction.</p>
                {errors.startingPrice && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.startingPrice}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Minimum Bid Increment (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                  <input
                    type="number"
                    min="1"
                    value={minIncrement}
                    onChange={(e) => setMinIncrement(Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-bold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Every new bid must exceed the prior by at least this amount.</p>
                {errors.minIncrement && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.minIncrement}</p>
                )}
              </div>
            </div>

            {/* Reserve Price Section */}
            <div className="p-4 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-3">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasReserve}
                  onChange={(e) => setHasReserve(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <div>
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-200">
                    Set a Confidential Reserve Price
                  </span>
                  <p className="text-[11px] text-purple-800 dark:text-purple-300">
                    The item will only be sold if final bidding meets or exceeds this confidential floor.
                  </p>
                </div>
              </label>

              {hasReserve && (
                <div className="pt-2">
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      min={startingPrice}
                      value={reservePrice}
                      onChange={(e) => setReservePrice(Number(e.target.value))}
                      placeholder="e.g. 1500"
                      className="w-full pl-8 pr-4 py-2 text-sm font-mono font-bold bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-xl border border-purple-200 dark:border-purple-800 focus:outline-hidden"
                    />
                  </div>
                  {errors.reservePrice && (
                    <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.reservePrice}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 3: SCHEDULE */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in fade-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span>Step 3: Auction Schedule</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                />
                {errors.startTime && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.startTime}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1.5">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs md:text-sm font-mono bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 focus:border-purple-600 focus:outline-hidden"
                />
                {errors.endTime && (
                  <p className="text-[11px] text-rose-500 mt-1 font-medium">{errors.endTime}</p>
                )}
              </div>
            </div>

            {/* Quick Duration Presets */}
            <div>
              <span className="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-2">
                Quick Duration Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => applyDurationPreset(1)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  ⚡ 1 Hour (Fast Demo)
                </button>
                <button
                  type="button"
                  onClick={() => applyDurationPreset(24)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  24 Hours
                </button>
                <button
                  type="button"
                  onClick={() => applyDurationPreset(72)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  3 Days
                </button>
                <button
                  type="button"
                  onClick={() => applyDurationPreset(168)}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  7 Days
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & PUBLISH */}
        {currentStep === 4 && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Step 4: Review and Publish</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="md:col-span-5 aspect-4/3 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-700">
                <SafeImage src={imageUrl} alt={title} fallbackCategory={category} className="w-full h-full" />
              </div>

              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-semibold">
                  <span>{category}</span>
                  <span>·</span>
                  <span>{condition}</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white">{title || 'Untitled Auction'}</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                  {description}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Starting Price</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      ${startingPrice.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Min Increment</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      +${minIncrement.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Reserve Price</span>
                    <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">
                      {hasReserve ? `$${reservePrice.toLocaleString()}` : 'None'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">End Date</span>
                    <span className="font-mono font-semibold text-slate-900 dark:text-white">
                      {new Date(endTime).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/50 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <p className="text-xs text-purple-900 dark:text-purple-200">
                Once published, this lot will be visible to collectors across the marketplace, included in your active auctions, and ready to accept bids immediately.
              </p>
            </div>
          </div>
        )}

        {/* Wizard Navigation Footer Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#7C3AED] hover:bg-purple-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePublish}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Auction Now</span>
            </button>
          )}
        </div>

      </div>

    </div>
  );
};
