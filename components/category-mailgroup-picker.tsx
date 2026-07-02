'use client'

import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Category } from '@/lib/subscription-types'
import type { MailGroup } from '@/lib/subscription-centre'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MultiSelect } from '@/components/multi-select'
import { FolderOpen, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const NEW_FOLDER = '__new_folder__'

interface CategoryMailgroupPickerProps {
  category: Category
  mailGroups: MailGroup[]
  onAddMailGroup: (group: MailGroup) => void
  onToggleMailGroup: (group: MailGroup, checked: boolean) => void
}

// Mirrors the Parent Mailgroup's "Use Existing / Create New" + Folder pattern, but the
// Mailgroup field is a multi-select so several groups from the same folder can be linked at
// once -- inline in the card, no modal. Checking/unchecking a mailgroup adds or removes it as
// a CategoryOption immediately, same as the option rows' own editing -- no staging step.
export function CategoryMailgroupPicker({ category, mailGroups, onAddMailGroup, onToggleMailGroup }: CategoryMailgroupPickerProps) {
  const folders = Array.from(new Set(mailGroups.map((g) => g.folder)))

  const [mode, setMode] = useState<'existing' | 'new'>(mailGroups.length > 0 ? 'existing' : 'new')
  const [selectedFolder, setSelectedFolder] = useState(folders[0] ?? '')
  const [newFolderChoice, setNewFolderChoice] = useState(folders[0] ?? NEW_FOLDER)
  const [newFolderName, setNewFolderName] = useState('')
  const [newGroupName, setNewGroupName] = useState('')

  const mailGroupsInFolder = mailGroups.filter((g) => g.folder === selectedFolder)
  const checkedMailGroupIds = category.options.map((o) => o.mailGroupId).filter((id): id is string => !!id)
  const selectedInFolder = checkedMailGroupIds.filter((id) => mailGroupsInFolder.some((g) => g.id === id))

  const handleSelectedChange = (nextSelected: string[]) => {
    const added = nextSelected.filter((id) => !selectedInFolder.includes(id))
    const removed = selectedInFolder.filter((id) => !nextSelected.includes(id))
    added.forEach((id) => {
      const group = mailGroupsInFolder.find((g) => g.id === id)
      if (group) onToggleMailGroup(group, true)
    })
    removed.forEach((id) => {
      const group = mailGroupsInFolder.find((g) => g.id === id)
      if (group) onToggleMailGroup(group, false)
    })
  }

  const resolvedNewFolder = newFolderChoice === NEW_FOLDER ? newFolderName.trim() : newFolderChoice
  const canCreate = resolvedNewFolder.length > 0 && newGroupName.trim().length > 0

  const handleCreateMailGroup = () => {
    if (!canCreate) return
    const group: MailGroup = { id: uuidv4(), name: newGroupName.trim(), folder: resolvedNewFolder }
    onAddMailGroup(group)
    onToggleMailGroup(group, true)
    setSelectedFolder(group.folder)
    setNewGroupName('')
    setNewFolderName('')
    setMode('existing')
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <Label className="text-sm font-medium">Add Mailgroups</Label>

      <div className="flex gap-1 rounded-md bg-muted p-1">
        <button
          type="button"
          onClick={() => setMode('existing')}
          disabled={mailGroups.length === 0}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors disabled:pointer-events-none disabled:opacity-50',
            mode === 'existing' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <FolderOpen className="h-3.5 w-3.5" />
          Use Existing
        </button>
        <button
          type="button"
          onClick={() => setMode('new')}
          className={cn(
            'flex flex-1 items-center justify-center gap-1.5 rounded-sm px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'new' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Create New
        </button>
      </div>

      {mode === 'existing' ? (
        <>
          <div className="space-y-2">
            <Label htmlFor={`category-add-folder-${category.id}`}>Folder <span className="text-destructive">*</span></Label>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger id={`category-add-folder-${category.id}`} className="w-full">
                <SelectValue placeholder="Select a folder" />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-add-mailgroups-${category.id}`}>Mailgroups <span className="text-destructive">*</span></Label>
            <MultiSelect
              id={`category-add-mailgroups-${category.id}`}
              options={mailGroupsInFolder.map((g) => ({ value: g.id, label: g.name }))}
              selected={selectedInFolder}
              onChange={handleSelectedChange}
              placeholder={selectedFolder ? 'Select mailgroups' : 'Choose a folder first'}
            />
          </div>
        </>
      ) : (
        <>
          <div className="space-y-2">
            <Label htmlFor={`category-new-folder-${category.id}`}>Folder <span className="text-destructive">*</span></Label>
            <Select value={newFolderChoice} onValueChange={setNewFolderChoice}>
              <SelectTrigger id={`category-new-folder-${category.id}`} className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map((folder) => (
                  <SelectItem key={folder} value={folder}>
                    {folder}
                  </SelectItem>
                ))}
                <SelectItem value={NEW_FOLDER}>+ New folder</SelectItem>
              </SelectContent>
            </Select>
            {newFolderChoice === NEW_FOLDER && (
              <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g., Partnerships" autoFocus />
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor={`category-new-mailgroup-name-${category.id}`}>Mailgroup Name <span className="text-destructive">*</span></Label>
            <Input
              id={`category-new-mailgroup-name-${category.id}`}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="e.g., Product Updates"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleCreateMailGroup()
                }
              }}
            />
          </div>

          <div className="flex justify-end">
            <Button type="button" size="sm" className="gap-2" disabled={!canCreate} onClick={handleCreateMailGroup}>
              Add Mailgroup
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
