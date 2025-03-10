"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { PlusCircle, X } from "lucide-react";

// Simplified type for just the overview part of the customization
interface OverviewCustomization {
  title: string;
  content: string;
  showPoints: boolean;
  points: string[];
}

interface OverviewEditorProps {
  overview: OverviewCustomization;
  onChange: (overview: OverviewCustomization) => void;
}

export function OverviewEditor({ 
  overview, 
  onChange,
}: OverviewEditorProps) {
  const [newPoint, setNewPoint] = useState("");

  const handleChange = (
    field: keyof OverviewCustomization,
    value: string | boolean | string[]
  ) => {
    onChange({
      ...overview,
      [field]: value,
    });
  };

  const handleAddPoint = () => {
    if (newPoint.trim()) {
      handleChange("points", [...overview.points, newPoint.trim()]);
      setNewPoint("");
    }
  };

  const handleRemovePoint = (index: number) => {
    const updatedPoints = [...overview.points];
    updatedPoints.splice(index, 1);
    handleChange("points", updatedPoints);
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Customize Welcome Screen</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="overview-title">Welcome Title</Label>
            <Input
              id="overview-title"
              value={overview.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Welcome title for your agent"
            />
          </div>
          
          <div>
            <Label htmlFor="overview-content">Welcome Message</Label>
            <Textarea
              id="overview-content"
              value={overview.content}
              onChange={(e) => handleChange("content", e.target.value)}
              placeholder="Describe what your agent can help with"
              rows={4}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="show-points"
              checked={overview.showPoints}
              onCheckedChange={(checked) => handleChange("showPoints", checked)}
            />
            <Label htmlFor="show-points">Show Capability Points</Label>
          </div>
          
          {overview.showPoints && (
            <div className="space-y-2">
              <Label>Capability Points</Label>
              
              <div className="space-y-2">
                {overview.points.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input value={point} disabled />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemovePoint(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Add a capability point"
                  value={newPoint}
                  onChange={(e) => setNewPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddPoint}
                  className="h-8 px-2"
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 