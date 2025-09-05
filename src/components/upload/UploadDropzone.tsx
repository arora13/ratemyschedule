import { useState, useCallback } from "react"
import { Upload, File, X, AlertCircle } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type UploadStatus = "idle" | "uploading" | "success" | "error"

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void
  onUpload: (file: File) => Promise<void>
  acceptedTypes?: string[]
  maxSize?: number // in mb
  className?: string
}

export function UploadDropzone({
  onFileSelect,
  onUpload,
  acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf", "image/svg+xml"],
  maxSize = 10,
  className,
}: UploadDropzoneProps) {
  // drag + drop state
  const [isDragOver, setIsDragOver] = useState(false)
  // track which file got picked
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  // upload status flag
  const [status, setStatus] = useState<UploadStatus>("idle")
  // fake progress counter
  const [progress, setProgress] = useState(0)
  // error msg if validation/upload fails
  const [error, setError] = useState<string | null>(null)

  // check file type + size
  const validateFile = (file: File): string | null => {
    if (!acceptedTypes.includes(file.type)) {
      return `file type not supported. allowed: ${acceptedTypes
        .map((t) => t.split("/")[1])
        .join(", ")}`
    }
    if (file.size > maxSize * 1024 * 1024) {
      return `file too large. max size: ${maxSize}mb`
    }
    return null
  }

  // when a file is dropped/selected
  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        setStatus("error")
        return
      }
      setSelectedFile(file)
      setError(null)
      setStatus("idle")
      onFileSelect(file)
    },
    [onFileSelect, acceptedTypes, maxSize]
  )

  // handle drag-drop
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) handleFile(files[0])
    },
    [handleFile]
  )

  // handle file input click
  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) handleFile(files[0])
    },
    [handleFile]
  )

  // actually run the upload
  const handleUpload = async () => {
    if (!selectedFile) return
    setStatus("uploading")
    setProgress(0)

    try {
      // fake progress bar increment
      const interval = setInterval(() => {
        setProgress((p) => Math.min(p + 10, 90))
      }, 100)

      await onUpload(selectedFile)

      clearInterval(interval)
      setProgress(100)
      setStatus("success")
    } catch (err) {
      setStatus("error")
      setError(err instanceof Error ? err.message : "upload failed")
    }
  }

  // reset to clean slate
  const resetUpload = () => {
    setSelectedFile(null)
    setStatus("idle")
    setProgress(0)
    setError(null)
  }

  return (
    <Card
      className={cn(
        "relative border-2 border-dashed transition-all duration-300",
        isDragOver && "border-primary bg-primary/5",
        status === "error" && "border-destructive",
        status === "success" && "border-primary bg-primary/5",
        className
      )}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragOver(true)
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      <div className="p-8">
        {/* if no file yet, show drag/drop area */}
        {!selectedFile ? (
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">upload your class schedule</h3>
            <p className="text-muted-foreground mb-4">drag + drop, or click to browse</p>
            <p className="text-sm text-muted-foreground mb-6">
              supports png, jpg, pdf, svg up to {maxSize}mb
            </p>
            <Button variant="upload" asChild>
              <label className="cursor-pointer">
                choose file
                <input
                  type="file"
                  className="hidden"
                  accept={acceptedTypes.join(",")}
                  onChange={handleFileInput}
                />
              </label>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* file info row */}
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <div className="flex items-center space-x-3">
                <File className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} mb
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={resetUpload}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* progress bar while uploading */}
            {status === "uploading" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>uploading...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* error state */}
            {status === "error" && error && (
              <div className="flex items-center space-x-2 text-destructive text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            {/* success state */}
            {status === "success" && (
              <div className="text-center">
                <div className="text-primary text-sm font-medium mb-2">✓ upload successful!</div>
              </div>
            )}

            {/* show upload button if idle/error */}
            {status !== "uploading" && status !== "success" && (
              <Button variant="upload" onClick={handleUpload} className="w-full">
                upload & parse schedule
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
