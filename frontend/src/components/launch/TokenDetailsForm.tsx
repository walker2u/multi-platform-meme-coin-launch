'use client';

import React, { useRef } from 'react';
import { TokenFormData } from '@/types/launch';
import { Input } from '@/components/ui/Input';
import { UploadCloud, Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface TokenDetailsFormProps {
  formData: TokenFormData;
  onChange: (fields: Partial<TokenFormData>) => void;
}

export function TokenDetailsForm({ formData, onChange }: TokenDetailsFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      onChange({
        imageFile: file,
        imagePreviewUrl: previewUrl,
      });
    }
  };

  const removeImage = () => {
    if (formData.imagePreviewUrl) {
      URL.revokeObjectURL(formData.imagePreviewUrl);
    }
    onChange({
      imageFile: null,
      imagePreviewUrl: null,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <Sparkles className="w-4 h-4 text-primary" />
        Token Metadata & Brand
      </div>

      {/* Image Upload Area */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 block">
          Token Icon
        </label>
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative border-2 border-dashed border-white/15 hover:border-primary/50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all bg-surface/50 hover:bg-surface-light group"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            accept="image/png,image/jpeg,image/gif,image/webp"
            className="hidden"
          />

          {formData.imagePreviewUrl ? (
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-white/20">
              <img
                src={formData.imagePreviewUrl}
                alt="Token preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-500 text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="w-20 h-20 rounded-xl bg-surface-light border border-white/10 flex flex-col items-center justify-center shrink-0 text-slate-400 group-hover:text-primary transition-colors">
              <UploadCloud className="w-8 h-8 mb-1" />
              <span className="text-[10px] font-medium">Upload</span>
            </div>
          )}

          <div className="flex flex-col text-left">
            <span className="text-sm font-medium text-white group-hover:text-primary transition-colors">
              {formData.imageFile ? formData.imageFile.name : 'Choose token icon'}
            </span>
            <span className="text-xs text-slate-400 mt-0.5">
              Recommended 500x500 PNG, JPG, or GIF (Max 5MB)
            </span>
            <span className="text-[11px] text-primary/80 mt-1">
              Pinned decentralized to IPFS
            </span>
          </div>
        </div>
      </div>

      {/* Name and Symbol */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Token Name"
          placeholder="e.g. Moon Doge"
          value={formData.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
        <Input
          label="Symbol / Ticker"
          placeholder="e.g. MDOGE"
          value={formData.symbol}
          onChange={(e) => onChange({ symbol: e.target.value.toUpperCase() })}
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Description
        </label>
        <textarea
          rows={3}
          placeholder="Describe your meme token community vision, memes, and lore..."
          value={formData.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="w-full bg-surface border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 transition-all duration-200 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none shadow-inner"
        />
      </div>

      {/* Social Links */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Twitter / X"
          placeholder="https://x.com/..."
          value={formData.twitter || ''}
          onChange={(e) => onChange({ twitter: e.target.value })}
        />
        <Input
          label="Telegram"
          placeholder="https://t.me/..."
          value={formData.telegram || ''}
          onChange={(e) => onChange({ telegram: e.target.value })}
        />
        <Input
          label="Website"
          placeholder="https://..."
          value={formData.website || ''}
          onChange={(e) => onChange({ website: e.target.value })}
        />
      </div>

      {/* Dev Buy Snipe Amount */}
      <div className="p-4 rounded-xl bg-surface-light border border-white/10">
        <Input
          label="Initial Dev Buy (Snipe in same block)"
          placeholder="0.0"
          type="number"
          step="0.01"
          min="0"
          value={formData.devBuyAmount}
          onChange={(e) => onChange({ devBuyAmount: e.target.value })}
          helperText="Amount of native token (ETH / BNB / SOL) to buy in the creation transaction."
        />
      </div>
    </div>
  );
}
