
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trash2, Save, X, Edit2, Plus } from 'lucide-react';
import { TipEntry } from '@/hooks/useTipEntries';
import { ConfirmationModal } from '@/components/ConfirmationModal';

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
  const [totalSales, setTotalSales] = useState(existingEntry?.totalSales.toString() || '');
  const [creditTips, setCreditTips] = useState(existingEntry?.creditTips.toString() || '');
  const [cashTips, setCashTips] = useState(existingEntry?.cashTips.toString() || '');
  const [guestCount, setGuestCount] = useState(existingEntry?.guestCount.toString() || '');
  const [section, setSection] = useState(existingEntry?.section || '');
  
  const [shift, setShift] = useState<'AM' | 'PM' | 'Double'>(existingEntry?.shift || 'PM');
  const [hoursWorked, setHoursWorked] = useState(existingEntry?.hoursWorked.toString() || '');
  const [hourlyRate, setHourlyRate] = useState(
    existingEntry?.hourlyRate.toString() || previousEntry?.hourlyRate.toString() || ''
  );
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string>('');
  const [editingSectionName, setEditingSectionName] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSectionDeleteConfirm, setShowSectionDeleteConfirm] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<string>('');

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
    
    const entry = {
      date: selectedDate,
      totalSales: parseFloat(totalSales) || 0,
      creditTips: parseFloat(creditTips) || 0,
      cashTips: parseFloat(cashTips) || 0,
      guestCount: parseInt(guestCount) || 0,
      section: section || Object.keys(sections)[0],
      
      shift,
      hoursWorked: parseFloat(hoursWorked) || 0,
      hourlyRate: parseFloat(hourlyRate) || 0
    };

    onSave(entry);
  };

  const isValid = totalSales && creditTips !== undefined && cashTips !== undefined && 
                  guestCount && section && hoursWorked && hourlyRate;

  const totalTips = (parseFloat(creditTips) || 0) + (parseFloat(cashTips) || 0);
  const totalEarnings = totalTips + ((parseFloat(hoursWorked) || 0) * (parseFloat(hourlyRate) || 0));

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


            {/* Enhanced Calculated Statistics */}
            {totalSales && (creditTips || cashTips) && hoursWorked && hourlyRate && (
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
                      {totalSales ? (totalTips / parseFloat(totalSales) * 100).toFixed(1) : 0}%
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
        </CardContent>
      </Card>

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
    </div>
  );
};
