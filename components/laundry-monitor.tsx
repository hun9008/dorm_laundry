"use client"

import { useState, useEffect } from "react"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type Machine = {
  id: string
  type: "washer" | "dryer"
  status: "available" | "running" | "broken"
  timeLeft: number
}

export function LaundryMonitor() {
  const [machines, setMachines] = useState<Machine[]>([
    // Dryers (top row)
    { id: "d1", type: "dryer", status: "available", timeLeft: 0 },
    { id: "d2", type: "dryer", status: "available", timeLeft: 0 },
    { id: "d3", type: "dryer", status: "available", timeLeft: 0 },
    // Washers (left column)
    { id: "w1", type: "washer", status: "available", timeLeft: 0 },
    { id: "w2", type: "washer", status: "available", timeLeft: 0 },
    { id: "w3", type: "washer", status: "available", timeLeft: 0 },
    { id: "w4", type: "washer", status: "available", timeLeft: 0 },
  ])

  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<"start" | "cancel">("start")

  const handleMachineClick = (machine: Machine) => {
    setSelectedMachine(machine)
    if (machine.status === "available") {
      setDialogAction("start")
      setIsDialogOpen(true)
    } else if (machine.status === "running") {
      setDialogAction("cancel")
      setIsDialogOpen(true)
    }
  }

  const confirmAction = () => {
    if (selectedMachine) {
      setMachines(prev =>
        prev.map(machine => {
          if (machine.id === selectedMachine.id) {
            if (dialogAction === "start" && machine.status === "available") {
              return {
                ...machine,
                status: "running",
                timeLeft: machine.type === "washer" ? 50 : 55,
              }
            } else if (dialogAction === "cancel" && machine.status === "running") {
              return {
                ...machine,
                status: "available",
                timeLeft: 0,
              }
            }
          }
          return machine
        })
      )
    }
    setIsDialogOpen(false)
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setMachines(prev =>
        prev.map(machine => {
          if (machine.status === "running" && machine.timeLeft > 0) {
            const newTimeLeft = machine.timeLeft - 1
            return {
              ...machine,
              timeLeft: newTimeLeft,
              status: newTimeLeft === 0 ? "available" : "running",
            }
          }
          return machine
        })
      )
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  const toggleBroken = (id: string) => {
    setMachines(prev =>
      prev.map(machine => {
        if (machine.id === id) {
          return {
            ...machine,
            status: machine.status === "broken" ? "available" : "broken",
            timeLeft: 0,
          }
        }
        return machine
      })
    )
  }

  const dryers = machines.filter(m => m.type === "dryer")
  const washers = machines.filter(m => m.type === "washer")

  return (
    <div className="p-4 max-w-md mx-auto">

      <h1 className="text-xl font-semibold text-center my-4">국제학사 세탁실</h1>

      <div className="grid grid-cols-4 grid-rows-5 gap-4">
        {/* Empty cell (0,0) */}
        <div className="col-start-1 row-start-1"></div>

        {/* Dryers (0,1), (0,2), (0,3) */}
        {dryers.map((machine, index) => (
          <div key={machine.id} className={`col-start-${index + 2} row-start-1`}>
            <MachineIcon
              machine={machine}
              onClick={() => handleMachineClick(machine)}
              onToggleBroken={() => toggleBroken(machine.id)}
            />
          </div>
        ))}

        {/* Washers (1,0), (2,0), (3,0), (4,0) */}
        {washers.map((machine, index) => (
          <div key={machine.id} className={`col-start-1 row-start-${index + 2}`}>
            <MachineIcon
              machine={machine}
              onClick={() => handleMachineClick(machine)}
              onToggleBroken={() => toggleBroken(machine.id)}
            />
          </div>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "start" ? "기기 작동 확인" : "작동 취소 확인"}
            </DialogTitle>
            <DialogDescription>
              {selectedMachine?.type === "washer" ? "세탁기" : "건조기"} {selectedMachine?.id.slice(1)}
              {dialogAction === "start" ? "을(를) 작동하시겠습니까?" : "의 작동을 취소하시겠습니까?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              취소
            </Button>
            <Button onClick={confirmAction}>확인</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function MachineIcon({
  machine,
  onClick,
  onToggleBroken,
}: {
  machine: Machine
  onClick: () => void
  onToggleBroken: () => void
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        className={`w-16 h-16 rounded-full border-4 flex items-center justify-center mb-2 ${
          machine.status === "broken"
            ? "bg-destructive/10 border-destructive"
            : machine.status === "running"
            ? "bg-primary/10 border-primary animate-pulse"
            : "bg-secondary border-secondary hover:bg-accent hover:border-accent"
        }`}
        onClick={onClick}
      >
        <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center">
          {machine.status === "broken" ? (
            <AlertCircle className="w-4 h-4 text-destructive" />
          ) : machine.status === "running" ? (
            <span className="text-xs font-semibold">{machine.timeLeft}</span>
          ) : (
            <span className="text-xs">{machine.type === "washer" ? "W" : "D"}</span>
          )}
        </div>
      </button>
      <div className="text-xs font-semibold mb-1">
        {machine.type === "washer" ? "세탁기" : "건조기"} {machine.id.slice(1)}
      </div>
      <Button
        variant="outline"
        size="sm"
        className="text-xs px-2 py-1 h-auto"
        onClick={onToggleBroken}
      >
        {machine.status === "broken" ? "수리" : "고장"}
      </Button>
    </div>
  )
}