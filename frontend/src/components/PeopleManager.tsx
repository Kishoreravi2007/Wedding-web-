"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Edit, Trash2, Users } from 'lucide-react';

interface Person {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface PeopleManagerProps {
  people: Person[];
  onPeopleChange: (people: Person[]) => void;
}

const PeopleManager: React.FC<PeopleManagerProps> = ({ people, onPeopleChange }) => {
  const [isAddingPerson, setIsAddingPerson] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [newPersonName, setNewPersonName] = useState('');
  const [newPersonRole, setNewPersonRole] = useState('');

  const roles = ['Bride', 'Groom', 'Family', 'Friend', 'Vendor', 'Other'];

  const handleAddPerson = () => {
    if (newPersonName.trim() && newPersonRole) {
      const newPerson: Person = {
        id: Date.now().toString(),
        name: newPersonName.trim(),
        role: newPersonRole,
        avatar: ''
      };
      onPeopleChange([...people, newPerson]);
      setNewPersonName('');
      setNewPersonRole('');
      setIsAddingPerson(false);
    }
  };

  const handleUpdatePerson = () => {
    if (editingPerson && newPersonName.trim() && newPersonRole) {
      const updatedPeople = people.map(person =>
        person.id === editingPerson.id
          ? { ...person, name: newPersonName.trim(), role: newPersonRole }
          : person
      );
      onPeopleChange(updatedPeople);
      setEditingPerson(null);
      setNewPersonName('');
      setNewPersonRole('');
    }
  };

  const handleDeletePerson = (personId: string) => {
    onPeopleChange(people.filter(person => person.id !== personId));
  };

  const startEditing = (person: Person) => {
    setEditingPerson(person);
    setNewPersonName(person.name);
    setNewPersonRole(person.role);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <CardTitle>People Management</CardTitle>
          </div>
          <Dialog open={isAddingPerson} onOpenChange={setIsAddingPerson}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Add Person
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Person</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Name</label>
                  <Input
                    value={newPersonName}
                    onChange={(e) => setNewPersonName(e.target.value)}
                    placeholder="Enter person's name"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role</label>
                  <Select value={newPersonRole} onValueChange={setNewPersonRole}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role} value={role}>
                          {role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddPerson} className="flex-1">
                    Add Person
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddingPerson(false);
                      setNewPersonName('');
                      setNewPersonRole('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {people.map((person) => (
            <Card key={person.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">{person.name}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {person.role}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => startEditing(person)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePerson(person.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {people.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No people added yet. Add people to tag them in photos.</p>
          </div>
        )}
      </CardContent>

      {/* Edit Person Dialog */}
      <Dialog open={!!editingPerson} onOpenChange={() => setEditingPerson(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Person</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newPersonName}
                onChange={(e) => setNewPersonName(e.target.value)}
                placeholder="Enter person's name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={newPersonRole} onValueChange={setNewPersonRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpdatePerson} className="flex-1">
                Update Person
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditingPerson(null);
                  setNewPersonName('');
                  setNewPersonRole('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PeopleManager;
