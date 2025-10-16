"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { authService } from "@/lib/auth-service"
import { Recycle, Coins, Leaf } from "lucide-react"

const MATERIALS = [
  { value: 'paper', label: 'Paper', color: 'bg-amber-100 text-amber-800' },
  { value: 'plastic', label: 'Plastic', color: 'bg-blue-100 text-blue-800' },
  { value: 'glass', label: 'Glass', color: 'bg-green-100 text-green-800' },
  { value: 'metal', label: 'Metal', color: 'bg-gray-100 text-gray-800' },
  { value: 'organic', label: 'Organic', color: 'bg-orange-100 text-orange-800' }
]

const COIN_RATES = {
  paper: 2,
  plastic: 3,
  glass: 4,
  metal: 5,
  organic: 1
}

interface RecyclingFormProps {
  onSubmitted?: () => void
}

export default function RecyclingForm({ onSubmitted }: RecyclingFormProps) {
  const [formData, setFormData] = useState({
    material: '',
    weight: '',
    location: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const token = authService.getToken()
      if (!token) {
        setError('Please log in to record recycling activities')
        return
      }

      const response = await fetch('/api/recycling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          material: formData.material,
          weight: parseFloat(formData.weight),
          location: formData.location || undefined,
          notes: formData.notes || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to record recycling activity')
      }

      setResult(data)
      setFormData({ material: '', weight: '', location: '', notes: '' })
      
      // Refresh user data
      await authService.getProfile()
      
      // Notify parent component
      onSubmitted?.()

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const selectedMaterial = MATERIALS.find(m => m.value === formData.material)
  const estimatedCoins = formData.material && formData.weight 
    ? Math.round((parseFloat(formData.weight) || 0) * (COIN_RATES[formData.material as keyof typeof COIN_RATES] || 0))
    : 0

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Recycle className="h-5 w-5 text-green-600" />
            Log Your Recycling Activity
          </CardTitle>
          <CardDescription>
            Record your recycling activities and earn eco coins for your sustainability efforts!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="material">Material Type *</Label>
                <Select 
                  value={formData.material} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, material: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select material type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MATERIALS.map((material) => (
                      <SelectItem key={material.value} value={material.value}>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded text-xs ${material.color}`}>
                            {material.label}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg) *</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder="0.0"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input
                id="location"
                placeholder="e.g., Home, Office, Community Center"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes about your recycling activity..."
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>

            {formData.material && formData.weight && (
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Estimated Coins:</span>
                  </div>
                  <span className="text-lg font-bold text-yellow-600">
                    {estimatedCoins} coins
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">
                    CO₂ Saved: ~{((parseFloat(formData.weight) || 0) * 1.2).toFixed(1)} kg
                  </span>
                </div>
              </div>
            )}

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700"
              disabled={loading || !formData.material || !formData.weight}
            >
              {loading ? 'Recording...' : 'Record Recycling Activity'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="text-2xl">🎉</div>
              <h3 className="text-lg font-semibold text-green-800">
                Recycling Activity Recorded!
              </h3>
              <div className="space-y-1 text-sm text-green-700">
                <p><strong>Material:</strong> {selectedMaterial?.label}</p>
                <p><strong>Weight:</strong> {result.activity.weight || 0} kg</p>
                <p><strong>Coins Earned:</strong> {result.activity.coinsEarned || 0}</p>
                <p><strong>CO₂ Saved:</strong> {(result.activity.co2Saved || 0).toFixed(1)} kg</p>
              </div>
              <div className="pt-2 text-xs text-green-600">
                Your total eco coins: {result.userStats?.ecoCoins || 0}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
