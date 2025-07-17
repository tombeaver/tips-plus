
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Save, X } from 'lucide-react';
import { TipEntry } from '@/pages/Index';

interface TipEntryFormProps {
  selectedDate: Date;
  existingEntry?: TipEntry;
  onSave: (entry: Omit<TipEntry, 'id'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

export const TipEntryForm: React.FC<TipEntryFormProps> = ({
  selectedDate,
  existingEntry,
  onSave,
  onCancel,
  onDelete
}) => {
  const [totalSales, setTotalSales] = useState(existingEntry?.totalSales.toString() || '');
  const [creditTips, setCreditTips] = useState(existingEntry?.creditTips.toString() || '');
  const [cashTips, setCashTips] = useState(existingEntry?.cashTips.toString() || '');
  const [guestCount, setGuestCount] = useState(existingEntry?.guestCount.toString() || '');
  const [section, setSection] = useState(existingEntry?.section || '');
  const [isPlaceholder, setIsPlaceholder] = useState(existingEntry?.isPlaceholder || false);

  const sections = [
    'Section 1', 'Section 2', 'Section 3', 'Section 4', 'Section 5',
    'Bar', 'Patio', 'Private Dining', 'Takeout', 'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry = {
      date: selectedDate,
      totalSales: parseFloat(totalSales) || 0,
      creditTips: parseFloat(creditTips) || 0,
      cashTips: parseFloat(cashTips) || 0,
      guestCount: parseInt(guestCount) || 0,
      section: section || 'Other',
      isPlaceholder
    };

    onSave(entry);
  };

  const isValid = totalSales && creditTips !== undefined && cashTips !== undefined && 
                  guestCount && section;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>
                {existingEntry ? 'Edit Tip Entry' : 'Add Tip Entry'}
              </CardTitle>
              <CardDescription>
                {selectedDate.toLocaleDateString()}
              </CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="totalSales">Total Sales ($)</Label>
              <Input
                id="totalSales"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={totalSales}
                onChange={(e) => setTotalSales(e.target.value)}
                required
              />
            </div>

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
              <Label htmlFor="section">Section</Label>
              <Select value={section} onValueChange={setSection} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select section" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((sec) => (
                    <SelectItem key={sec} value={sec}>
                      {sec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="placeholder"
                checked={isPlaceholder}
                onCheckedChange={setIsPlaceholder}
              />
              <Label htmlFor="placeholder">Planning scenario (placeholder)</Label>
            </div>

            {/* Calculated Statistics */}
            {totalSales && (creditTips || cashTips) && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <h4 className="font-medium text-sm text-gray-700">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Total Tips:</span>
                    <span className="font-medium ml-2">
                      ${((parseFloat(creditTips) || 0) + (parseFloat(cashTips) || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Tip %:</span>
                    <span className="font-medium ml-2">
                      {totalSales ? (((parseFloat(creditTips) || 0) + (parseFloat(cashTips) || 0)) / parseFloat(totalSales) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  {guestCount && (
                    <div className="col-span-2">
                      <span className="text-gray-600">Per Guest:</span>
                      <span className="font-medium ml-2">
                        ${(((parseFloat(creditTips) || 0) + (parseFloat(cashTips) || 0)) / parseInt(guestCount)).toFixed(2)}
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
                  onClick={onDelete}
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
        </CardContent>
      </Card>
    </div>
  );
};
