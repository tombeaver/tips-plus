
import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Trash2, Save, X, Edit2, Plus, Frown, Meh, Smile, Laugh, Zap, ChevronDown, ChevronUp, Wine, Beer, GlassWater, ShoppingBag } from 'lucide-react';
import { TipEntry, SalesBreakdown } from '@/hooks/useTipEntries';
import { ConfirmationModal } from '@/components/ConfirmationModal';
import { PurpleModalHeader } from '@/components/PurpleModalHeader';

interface TipEntryFormProps {
  selectedDate: Date;
  existingEntry?: TipEntry;
  onSave: (entry: Omit<TipEntry, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  previousEntry?: TipEntry;
  sections: { [key: string]: string };
  onUpdateSections: (sections: { [key: string]: string }) => void;
}

export const TipEntryForm: React.FC<TipEntryFormProps> = ({
  selectedDate,
  existingEntry,
  onSave,
  onCancel,
  onDelete,
  previousEntry,
  sections,
  onUpdateSections
}) => {
  // Food sales is the main input (was totalSales)
  const [foodSales, setFoodSales] = useState(() => {
    // If editing and we have breakdown, calculate food from total - alcohol - misc
    if (existingEntry?.salesBreakdown) {
      const breakdown = existingEntry.salesBreakdown;
      const additionalSales = breakdown.liquor + breakdown.beer + breakdown.wine + breakdown.misc;
      return (existingEntry.totalSales - additionalSales).toString();
    }
    return existingEntry?.totalSales.toString() || '';
  });
  const [salesBreakdownOpen, setSalesBreakdownOpen] = useState(false);
  const [salesCategories, setSalesCategories] = useState({
    liquor: existingEntry?.salesBreakdown?.liquor || 0,
    beer: existingEntry?.salesBreakdown?.beer || 0,
    wine: existingEntry?.salesBreakdown?.wine || 0,
    misc: existingEntry?.salesBreakdown?.misc || 0,
  });
  const [creditTips, setCreditTips] = useState(existingEntry?.creditTips.toString() || '');
  const [cashTips, setCashTips] = useState(existingEntry?.cashTips.toString() || '');
  const [guestCount, setGuestCount] = useState(existingEntry?.guestCount.toString() || '');
  const [section, setSection] = useState(existingEntry?.section || '');
  
  const [shift, setShift] = useState<'AM' | 'PM' | 'Double'>(existingEntry?.shift || 'PM');
  const [hoursWorked, setHoursWorked] = useState(existingEntry?.hoursWorked.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(
    existingEntry?.hourlyRate.toString() || previousEntry?.hourlyRate.toString() || ''
  );
  const [moodRating, setMoodRating] = useState<number | undefined>(existingEntry?.moodRating);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string>('');
  const [editingSectionName, setEditingSectionName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSectionDeleteConfirm, setShowSectionDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string>('');

  // Alcohol total (liquor + beer + wine)
  const alcoholTotal = useMemo(() => {
    return salesCategories.liquor + salesCategories.beer + salesCategories.wine;
  }, [salesCategories]);

  // Additional sales total (alcohol + misc)
  const additionalTotal = useMemo(() => {
    return salesCategories.liquor + salesCategories.beer + 
           salesCategories.wine + salesCategories.misc;
  }, [salesCategories]);

  // Food sales value
  const foodSalesValue = parseFloat(foodSales) || 0;

  // Total sales = food + alcohol + misc
  const calculatedTotalSales = useMemo(() => {
    return foodSalesValue + additionalTotal;
  }, [foodSalesValue, additionalTotal]);

  // Whether we have any additional categories
  const hasAdditionalSales = additionalTotal > 0;

  const handleCategoryChange = (key: keyof typeof salesCategories, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSalesCategories(prev => ({ ...prev, [key]: numValue }));
  };

  const handleFoodSalesChange = (value: string) => {
    setFoodSales(value);
  };

  const addNewSection = () => {
    if (newSectionName.trim()) {
      const newId = `section-${Date.now()}`;
      onUpdateSections({
        ...sections,
        [newId]: newSectionName.trim()
      });
      setNewSectionName('');
    }
  };

  const deleteSection = (sectionId: string) => {
    const updatedSections = { ...sections };
    delete updatedSections[sectionId];
    onUpdateSections(updatedSections);
    
    // If the currently selected section was deleted, reset to first available
    const sectionName = sections[sectionId];
    if (section === sectionName) {
      const remainingSections = Object.values(updatedSections);
      setSection(remainingSections[0] || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitting with shift:', shift, 'Type:', typeof shift);
    console.log('Form submitting with selectedDate:', selectedDate);
    console.log('selectedDate details:', {
      toString: selectedDate.toString(),
      toISOString: selectedDate.toISOString(),
      toLocaleDateString: selectedDate.toLocaleDateString(),
      getTimezoneOffset: selectedDate.getTimezoneOffset(),
      getFullYear: selectedDate.getFullYear(),
      getMonth: selectedDate.getMonth(),
      getDate: selectedDate.getDate()
    });
    
    // Build sales breakdown
    const salesBreakdown: SalesBreakdown = salesBreakdownOpen ? {
      liquor: salesCategories.liquor,
      beer: salesCategories.beer,
      wine: salesCategories.wine,
      misc: salesCategories.misc,
    } : {
      liquor: 0,
      beer: 0,
      wine: 0,
      misc: 0,
    };
    
    // Calculate alcohol sales from breakdown (liquor + beer + wine, not misc)
    const alcoholSales = salesBreakdown.liquor + salesBreakdown.beer + salesBreakdown.wine;
    
    const entry = {
      date: selectedDate,
      totalSales: calculatedTotalSales,
      alcoholSales: alcoholSales > 0 ? alcoholSales : undefined,
      salesBreakdown: salesBreakdownOpen ? salesBreakdown : undefined,
      creditTips: parseFloat(creditTips) || 0,
      cashTips: parseFloat(cashTips) || 0,
      guestCount: parseInt(guestCount) || 0,
      section: section || Object.keys(sections)[0],
      shift,
      hoursWorked: parseFloat(hoursWorked) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0,
      moodRating
    };

    onSave(entry);
  };

  const isValid = calculatedTotalSales > 0 && creditTips !== undefined && cashTips !== undefined && 
                  guestCount && section && hoursWorked && hourlyRate;

  const totalTips = (parseFloat(creditTips) || 0) + (parseFloat(cashTips) || 0);
  const totalEarnings = totalTips + ((parseFloat(hoursWorked) || 0) * (parseFloat(hourlyRate) || 0));
  
  // Sales category config - alcohol categories
  const alcoholCategoryConfig = [
    { key: 'liquor' as const, label: 'Liquor', icon: GlassWater },
    { key: 'beer' as const, label: 'Beer', icon: Beer },
    { key: 'wine' as const, label: 'Wine', icon: Wine },
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent id="tip-entry-form" className="w-screen h-screen max-w-none p-0 gap-0 border-0 flex flex-col">
        <PurpleModalHeader 
          title={existingEntry ? 'Edit Tip Entry' : 'Add Tip Entry'} 
          onClose={onCancel} 
        />
        
        <div className="overflow-y-auto flex-1 bg-background p-6">
          <p className="text-sm text-muted-foreground mb-6">
            {selectedDate.toLocaleDateString()}
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Food Sales by default, becomes Total Sales when additional categories added */}
            <div className="space-y-2">
              <Label htmlFor="foodSales">
                {hasAdditionalSales ? 'Total Sales ($)' : 'Food Sales ($)'}
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="foodSales"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={foodSales}
                    onChange={(e) => handleFoodSalesChange(e.target.value)}
                    required
                  />
                </div>
                <Collapsible open={salesBreakdownOpen} onOpenChange={setSalesBreakdownOpen}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="outline" size="icon">
                      {salesBreakdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                </Collapsible>
              </div>
              <p className="text-xs text-muted-foreground">
                Tap arrow to add alcohol &amp; other sales
              </p>
            </div>

            {/* Collapsible Sales Categories */}
            <Collapsible open={salesBreakdownOpen} onOpenChange={setSalesBreakdownOpen}>
              <CollapsibleContent>
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    Additional sales (added to food sales for total)
                  </p>
                  
                  {/* Alcohol Categories */}
                  <div className="space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Alcohol</span>
                    {alcoholCategoryConfig.map(({ key, label, icon: Icon }) => (
                      <div key={key} className="grid grid-cols-[1fr_120px] gap-3 items-center">
                        <Label className="flex items-center gap-2 text-sm">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          {label}
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0"
                            value={salesCategories[key] || ''}
                            onChange={(e) => handleCategoryChange(key, e.target.value)}
                            className="pl-7 h-9 text-right"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Misc Category - separate section */}
                  <div className="pt-3 mt-3 border-t border-border/50 space-y-2">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Other</span>
                    <div className="grid grid-cols-[1fr_120px] gap-3 items-center">
                      <Label className="flex items-center gap-2 text-sm">
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                        Misc
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0"
                          value={salesCategories.misc || ''}
                          onChange={(e) => handleCategoryChange('misc', e.target.value)}
                          className="pl-7 h-9 text-right"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Totals */}
                  <div className="pt-3 mt-3 border-t border-border/50">
                    <div className="grid grid-cols-[1fr_120px] gap-3 items-center">
                      <span className="text-sm text-muted-foreground">Alcohol Total</span>
                      <div className="text-right text-sm text-rose-600 font-medium">
                        ${alcoholTotal.toFixed(2)}
                      </div>
                    </div>
                    {salesCategories.misc > 0 && (
                      <div className="grid grid-cols-[1fr_120px] gap-3 items-center mt-1">
                        <span className="text-sm text-muted-foreground">Misc Total</span>
                        <div className="text-right text-sm text-amber-600 font-medium">
                          ${salesCategories.misc.toFixed(2)}
                        </div>
                      </div>
                    )}
                    <div className="grid grid-cols-[1fr_120px] gap-3 items-center mt-2">
                      <span className="font-medium text-sm">Total Sales</span>
                      <div className="text-right text-sm text-primary font-bold">
                        ${calculatedTotalSales.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Reset button */}
                  {additionalTotal > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-muted-foreground"
                      type="button"
                      onClick={() => {
                        setSalesCategories({
                          liquor: 0,
                          beer: 0,
                          wine: 0,
                          misc: 0,
                        });
                      }}
                    >
                      Clear all categories
                    </Button>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="creditTips">Credit Tips ($)</Label>
                <Input
                  id="creditTips"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={creditTips}
                  onChange={(e) => setCreditTips(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cashTips">Cash Tips ($)</Label>
                <Input
                  id="cashTips"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashTips}
                  onChange={(e) => setCashTips(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guestCount">Guest Count</Label>
              <Input
                id="guestCount"
                type="number"
                placeholder="0"
                value={guestCount}
                onChange={(e) => setGuestCount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="section">Section</Label>
                <Dialog open={showSectionEditor} onOpenChange={setShowSectionEditor}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit Sections
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Manage Sections</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {Object.entries(sections).map(([id, name]) => (
                          <div key={id} className="flex items-center gap-2">
                            <Input
                              value={editingSectionId === id ? editingSectionName : name}
                              onChange={(e) => {
                                if (editingSectionId === id) {
                                  setEditingSectionName(e.target.value);
                                } else {
                                  setEditingSectionId(id);
                                  setEditingSectionName(e.target.value);
                                }
                              }}
                              onBlur={() => {
                                if (editingSectionId === id && editingSectionName.trim()) {
                                  onUpdateSections({
                                    ...sections,
                                    [id]: editingSectionName.trim()
                                  });
                                }
                                setEditingSectionId('');
                                setEditingSectionName('');
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur();
                                }
                              }}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSectionToDelete(id);
                                setShowSectionDeleteConfirm(true);
                              }}
                              disabled={Object.keys(sections).length <= 1}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                      
                      <div className="border-t pt-3">
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="New section name"
                            value={newSectionName}
                            onChange={(e) => setNewSectionName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                addNewSection();
                              }
                            }}
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addNewSection}
                            disabled={!newSectionName.trim()}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={section} onValueChange={setSection} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(sections).map(([id, name]) => (
                    <SelectItem key={id} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Shift</Label>
              <RadioGroup value={shift} onValueChange={(value) => setShift(value as 'AM' | 'PM' | 'Double')}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="AM" id="am" />
                    <Label htmlFor="am" className="cursor-pointer">AM</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="PM" id="pm" />
                    <Label htmlFor="pm" className="cursor-pointer">PM</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Double" id="double" />
                    <Label htmlFor="double" className="cursor-pointer">Double</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hoursWorked">Hours Worked</Label>
                <Input
                  id="hoursWorked"
                  type="number"
                  step="0.25"
                  placeholder="0.0"
                  value={hoursWorked}
                  onChange={(e) => setHoursWorked(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Shift Mood / Difficulty</Label>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                {[1, 2, 3, 4, 5].map((rating) => {
                  const icons = [Frown, Meh, Smile, Laugh, Zap];
                  const labels = ['Very Hard', 'Hard', 'Okay', 'Good', 'Amazing'];
                  const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-purple-500'];
                  const isSelected = moodRating === rating;
                  const IconComponent = icons[rating - 1];
                  
                  return (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setMoodRating(rating)}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all ${
                        isSelected 
                          ? 'bg-white shadow-md scale-110' 
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <IconComponent 
                        className={`h-6 w-6 ${isSelected ? colors[rating - 1] : 'text-gray-400'}`}
                      />
                      <span className={`text-xs ${isSelected ? 'font-medium text-primary' : 'text-gray-600'}`}>
                        {labels[rating - 1]}
                      </span>
                    </button>
                  );
                })}
              </div>
              {moodRating && (
                <p className="text-sm text-gray-600 text-center">
                  You rated this shift: {['Very Hard', 'Hard', 'Okay', 'Good', 'Amazing'][moodRating - 1]}
                </p>
              )}
            </div>


            {/* Enhanced Calculated Statistics */}
            {calculatedTotalSales > 0 && (creditTips || cashTips) && hoursWorked && hourlyRate && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Total Tips:</span>
                    <span className="font-medium ml-2">
                      ${totalTips.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tip %:</span>
                    <span className="font-medium ml-2">
                      {calculatedTotalSales ? (totalTips / calculatedTotalSales * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Hourly Wage:</span>
                    <span className="font-medium ml-2">
                      ${hourlyRate}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tips/Hour:</span>
                    <span className="font-medium ml-2">
                      ${(totalTips / parseFloat(hoursWorked)).toFixed(2)}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Total Earnings:</span>
                    <span className="font-medium ml-2 text-green-600">
                      ${totalEarnings.toFixed(2)}
                    </span>
                  </div>
                  {guestCount && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Per Guest:</span>
                      <span className="font-medium ml-2">
                        ${(totalTips / parseInt(guestCount)).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {onDelete && (
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button 
                type="submit" 
                disabled={!isValid}
                className="flex-1"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>

      <ConfirmationModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={onDelete!}
        title="Delete Tip Entry"
        description="Are you sure you want to delete this tip entry? This action cannot be undone."
        confirmText="Delete Entry"
      />

      <ConfirmationModal
        isOpen={showSectionDeleteConfirm}
        onClose={() => {
          setShowSectionDeleteConfirm(false);
          setSectionToDelete('');
        }}
        onConfirm={() => {
          deleteSection(sectionToDelete);
          setSectionToDelete('');
        }}
        title="Delete Section"
        description={`Are you sure you want to delete the section "${sections[sectionToDelete]}"? This action cannot be undone.`}
        confirmText="Delete Section"
      />
    </Dialog>
  );
};
