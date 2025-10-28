"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { analyzeSTLFile, calculateCost, formatWeight, formatVolume, STLAnalysis } from "@/lib/stl-calculator"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  File, 
  X, 
  CheckCircle,
  AlertCircle,
  Package,
  Calculator,
  Info,
  Home,
  Zap,
  Save
} from "lucide-react"
import { PricingBreakdown } from "@/components/pricing-breakdown"
import { ManufacturingBadge } from "@/components/manufacturing-badge"

interface Material {
  id: string
  name: string
  description: string
  pricePerGram: number
  color: string
}

const materials: Material[] = [
  {
    id: "pla",
    name: "PLA",
    description: "Biodegradable, easy to print, good for prototypes",
    pricePerGram: 0.5,
    color: "bg-green-500"
  },
  {
    id: "abs",
    name: "ABS",
    description: "Durable, heat resistant, good for functional parts",
    pricePerGram: 0.7,
    color: "bg-blue-500"
  },
  {
    id: "petg",
    name: "PETG",
    description: "Strong, flexible, chemical resistant",
    pricePerGram: 0.8,
    color: "bg-purple-500"
  },
  {
    id: "tpu",
    name: "TPU",
    description: "Flexible, rubber-like, good for gaskets",
    pricePerGram: 1.2,
    color: "bg-orange-500"
  }
]

export default function UploadPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [notes, setNotes] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [estimatedCost, setEstimatedCost] = useState(0)
  const [stlAnalysis, setStlAnalysis] = useState<STLAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  // New state for enhanced features
  const [manufacturingType, setManufacturingType] = useState<"AT_HOME" | "ON_DEMAND">("ON_DEMAND")
  const [sellingPrice, setSellingPrice] = useState<number>(0)
  const [saveDesign, setSaveDesign] = useState<boolean>(false)
  const [designName, setDesignName] = useState<string>("")

  // Loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!session) {
    router.push("/auth/signin")
    return null
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.name.toLowerCase().endsWith('.stl')) {
        if (file.size > 10 * 1024 * 1024) {
          alert("File size too large. Maximum size is 10MB.")
          return
        }
        setSelectedFile(file)
        setStlAnalysis(null)
        setEstimatedCost(0)
        
        // Analyze STL file if material is selected
        if (selectedMaterial) {
          await analyzeSTL(file, selectedMaterial)
        }
      } else {
        alert("Please select a valid STL file (.stl extension)")
      }
    }
  }

  const analyzeSTL = async (file: File, materialId: string) => {
    if (!file) return
    
    setIsAnalyzing(true)
    try {
      console.log('Analyzing STL file:', file.name)
      const analysis = await analyzeSTLFile(file, materialId)
      setStlAnalysis(analysis)
      
      // Calculate cost using weight * 8
      const cost = calculateCost(analysis.weight, materialId, quantity)
      setEstimatedCost(cost)
      
      console.log('STL analysis completed:', {
        weight: analysis.weight,
        volume: analysis.volume,
        cost: cost
      })
    } catch (error) {
      console.error('STL analysis failed:', error)
      alert(`Failed to analyze STL file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleMaterialChange = async (materialId: string) => {
    setSelectedMaterial(materialId)
    
    if (selectedFile && materialId) {
      await analyzeSTL(selectedFile, materialId)
    }
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(newQuantity)
    
    if (stlAnalysis && selectedMaterial) {
      const cost = calculateCost(stlAnalysis.weight, selectedMaterial, newQuantity)
      setEstimatedCost(cost)
    }
  }

  const handleSubmit = async () => {
    
    if (!selectedFile || !selectedMaterial) {
      alert("Please select a file and material")
      return
    }

    console.log("=== UPLOAD STARTED ===")
    console.log("Session:", session)
    console.log("File:", selectedFile.name)
    console.log("Material:", selectedMaterial)

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Create form data
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('material', selectedMaterial)
      formData.append('quantity', quantity.toString())
      formData.append('notes', notes)
      formData.append('manufacturingType', manufacturingType)
      formData.append('sellingPrice', sellingPrice.toString())
      formData.append('saveDesign', saveDesign.toString())
      if (saveDesign && designName) {
        formData.append('designName', designName)
      }

      console.log("Sending request to API...")

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      // Make API request
      const response = await fetch('/api/orders/create', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      console.log("Response status:", response.status)

      if (response.ok) {
        const result = await response.json()
        console.log("Order created successfully:", result)
        alert("Order created successfully!")
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        console.error("Order creation failed:", errorData)
        alert(`Upload failed: ${errorData.message || 'Unknown error'}`)
      }

    } catch (error) {
      console.error("Upload error:", error)
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">Upload Your Design</h1>
          <p className="text-muted-foreground">
            Upload your STL file and we'll help you get it manufactured
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Design Upload</span>
                </CardTitle>
                <CardDescription>
                  Upload your STL file and configure your order
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file">STL File</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                      {selectedFile ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <File className="w-8 h-8 text-primary" />
                            <div>
                              <p className="font-medium">{selectedFile.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-lg font-medium mb-2">Drop your STL file here</p>
                          <p className="text-muted-foreground mb-4">
                            or click to browse files
                          </p>
                          <Input
                            id="file"
                            type="file"
                            accept=".stl"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => document.getElementById('file')?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Manufacturing Type Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="manufacturing-type">Manufacturing Type</Label>
                    <Select value={manufacturingType} onValueChange={(value: "AT_HOME" | "ON_DEMAND") => setManufacturingType(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select manufacturing type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ON_DEMAND">
                          <div className="flex items-center space-x-3">
                            <Zap className="w-4 h-4 text-blue-600" />
                            <div>
                              <p className="font-medium">On Demand Manufacturing</p>
                              <p className="text-sm text-muted-foreground">
                                Dropshipping for e-commerce integration
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="AT_HOME">
                          <div className="flex items-center space-x-3">
                            <Home className="w-4 h-4 text-orange-600" />
                            <div>
                              <p className="font-medium">At Home Manufacturing</p>
                              <p className="text-sm text-muted-foreground">
                                Bulk order for reselling
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Material Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="material">Material</Label>
                    <Select value={selectedMaterial} onValueChange={handleMaterialChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select material" />
                      </SelectTrigger>
                      <SelectContent>
                        {materials.map((material) => (
                          <SelectItem key={material.id} value={material.id}>
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 ${material.color} rounded-full`}></div>
                              <div>
                                <p className="font-medium">{material.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {material.description}
                                </p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Quantity - Only for AT_HOME */}
                  {manufacturingType === "AT_HOME" && (
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                        placeholder="Enter quantity"
                      />
                    </div>
                  )}


                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Input
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any special requirements or notes..."
                    />
                  </div>

                  {/* Save Design Option */}
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="save-design"
                        checked={saveDesign}
                        onChange={(e) => setSaveDesign(e.target.checked)}
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="save-design" className="flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save this design to E-Commerce</span>
                      </Label>
                    </div>
                    {saveDesign && (
                      <Input
                        placeholder="Enter design name (optional)"
                        value={designName}
                        onChange={(e) => setDesignName(e.target.value)}
                        className="ml-6"
                      />
                    )}
                  </div>

                  {/* STL Analysis */}
                  {isAnalyzing && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Analyzing STL file...</span>
                        <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full"></div>
                      </div>
                    </div>
                  )}

                  {/* STL Analysis Results */}
                  {stlAnalysis && (
                    <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm">STL Analysis Results</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Weight:</span>
                          <span className="ml-1 font-medium">{formatWeight(stlAnalysis.weight)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Volume:</span>
                          <span className="ml-1 font-medium">{formatVolume(stlAnalysis.volume)}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Dimensions:</span>
                          <span className="ml-1 font-medium">
                            {stlAnalysis.boundingBox.width.toFixed(1)} × {stlAnalysis.boundingBox.height.toFixed(1)} × {stlAnalysis.boundingBox.depth.toFixed(1)} mm
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Surface Area:</span>
                          <span className="ml-1 font-medium">{(stlAnalysis.surfaceArea / 100).toFixed(1)} cm²</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Upload Progress */}
                  {isUploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <Button
                    onClick={handleSubmit}
                    className="w-full"
                    disabled={!selectedFile || !selectedMaterial || isUploading}
                  >
                    {isUploading ? "Creating Product..." : "Create Product"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Manufacturing Type Badge */}
            <div className="flex items-center justify-center">
              <ManufacturingBadge type={manufacturingType} />
            </div>

            {/* Pricing Breakdown */}
            {estimatedCost > 0 && (
              <PricingBreakdown
                manufacturerCost={estimatedCost}
                sellingPrice={sellingPrice}
                profitPerUnit={sellingPrice - estimatedCost}
                quantity={manufacturingType === "AT_HOME" ? quantity : 1}
                manufacturingType={manufacturingType}
                onSellingPriceChange={setSellingPrice}
                editable={manufacturingType === "ON_DEMAND"}
              />
            )}

            {/* File Info */}
            {selectedFile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">File Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">File:</span>
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Size:</span>
                    <span className="text-sm font-medium">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  {selectedMaterial && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Material:</span>
                      <Badge variant="outline">
                        {materials.find(m => m.id === selectedMaterial)?.name}
                      </Badge>
                    </div>
                  )}
                  {manufacturingType === "AT_HOME" && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Quantity:</span>
                      <span className="text-sm font-medium">{quantity}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* STL Analysis Results */}
            {stlAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">STL Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Weight:</span>
                    <span className="text-sm font-medium">{formatWeight(stlAnalysis.weight)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Volume:</span>
                    <span className="text-sm font-medium">{formatVolume(stlAnalysis.volume)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dimensions:</span>
                    <span className="text-sm font-medium text-right">
                      {stlAnalysis.boundingBox.width.toFixed(0)} × {stlAnalysis.boundingBox.height.toFixed(0)} × {stlAnalysis.boundingBox.depth.toFixed(0)} mm
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Info className="w-5 h-5" />
                  <span>What Happens Next?</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Order Review</p>
                    <p className="text-xs text-muted-foreground">
                      We'll review your design and provide a final quote
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Production</p>
                    <p className="text-xs text-muted-foreground">
                      Your order goes into production with quality checks
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      We'll ship your finished product to you
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}