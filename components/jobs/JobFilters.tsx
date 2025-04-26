import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { jobCategories } from "@shared/schema";

interface JobFiltersProps {
  filters: any;
  onChange: (filters: any) => void;
}

export default function JobFilters({ filters, onChange }: JobFiltersProps) {
  // Job type filters
  const jobTypes = [
    { value: "Full-time", label: "Full-time" },
    { value: "Part-time", label: "Part-time" },
    { value: "Contract", label: "Contract" },
    { value: "Temporary", label: "Temporary" },
    { value: "Internship", label: "Internship" },
    { value: "Remote", label: "Remote" }
  ];
  
  // Experience level filters
  const experienceLevels = [
    { value: "Entry level", label: "Entry level" },
    { value: "Mid level", label: "Mid level" },
    { value: "Senior level", label: "Senior level" },
    { value: "Executive", label: "Executive" }
  ];
  
  // Date posted options
  const datePostedOptions = [
    { value: "1", label: "Last 24 hours" },
    { value: "7", label: "Last 7 days" },
    { value: "14", label: "Last 14 days" },
    { value: "30", label: "Last month" },
    { value: "any", label: "Any time" }
  ];
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<string>("");
  const [selectedDatePosted, setSelectedDatePosted] = useState<string>("any");
  const [selectedSalary, setSelectedSalary] = useState<number[]>([0, 150]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  
  // Update parent component when filters change
  useEffect(() => {
    const newFilters = { ...filters };
    
    if (selectedTypes.length > 0) {
      newFilters.type = selectedTypes.join(",");
    } else {
      delete newFilters.type;
    }
    
    if (selectedExperience) {
      newFilters.experience = selectedExperience;
    } else {
      delete newFilters.experience;
    }
    
    if (selectedDatePosted && selectedDatePosted !== "any") {
      newFilters.datePosted = selectedDatePosted;
    } else {
      delete newFilters.datePosted;
    }
    
    if (selectedSalary[0] > 0 || selectedSalary[1] < 150) {
      newFilters.minSalary = selectedSalary[0] * 1000;
      newFilters.maxSalary = selectedSalary[1] * 1000;
    } else {
      delete newFilters.minSalary;
      delete newFilters.maxSalary;
    }
    
    if (selectedCategories.length > 0) {
      newFilters.categories = selectedCategories.join(",");
    } else {
      delete newFilters.categories;
    }
    
    onChange(newFilters);
  }, [selectedTypes, selectedExperience, selectedDatePosted, selectedSalary, selectedCategories]);
  
  // Handle job type selection
  const handleTypeChange = (type: string) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  
  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Job Type Filter */}
      <div>
        <h3 className="text-sm font-medium mb-3">Job Type</h3>
        <div className="space-y-2">
          {jobTypes.map((type) => (
            <div key={type.value} className="flex items-center">
              <Checkbox 
                id={`type-${type.value}`} 
                checked={selectedTypes.includes(type.value)}
                onCheckedChange={() => handleTypeChange(type.value)}
              />
              <Label htmlFor={`type-${type.value}`} className="ml-2 text-sm">
                {type.label}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Categories Filter */}
      <div>
        <h3 className="text-sm font-medium mb-3">Categories</h3>
        <div className="space-y-2">
          {jobCategories.slice(0, 6).map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox 
                id={`category-${category.id}`} 
                checked={selectedCategories.includes(category.name)}
                onCheckedChange={() => handleCategoryChange(category.name)}
              />
              <Label htmlFor={`category-${category.id}`} className="ml-2 text-sm">
                {category.name} ({category.count})
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      {/* Experience Level Filter */}
      <div>
        <h3 className="text-sm font-medium mb-3">Experience Level</h3>
        <RadioGroup 
          value={selectedExperience} 
          onValueChange={setSelectedExperience}
        >
          {experienceLevels.map((level) => (
            <div key={level.value} className="flex items-center">
              <RadioGroupItem value={level.value} id={`experience-${level.value}`} />
              <Label htmlFor={`experience-${level.value}`} className="ml-2 text-sm">
                {level.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      
      {/* Salary Range Filter */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Salary Range</h3>
          <span className="text-xs text-slate-500">
            ${selectedSalary[0]}k - ${selectedSalary[1]}k
          </span>
        </div>
        <Slider
          value={selectedSalary}
          min={0}
          max={150}
          step={5}
          onValueChange={setSelectedSalary}
          className="mt-4"
        />
      </div>
      
      {/* Date Posted Filter */}
      <div>
        <h3 className="text-sm font-medium mb-3">Date Posted</h3>
        <RadioGroup 
          value={selectedDatePosted} 
          onValueChange={setSelectedDatePosted}
        >
          {datePostedOptions.map((option) => (
            <div key={option.value} className="flex items-center">
              <RadioGroupItem value={option.value} id={`date-${option.value}`} />
              <Label htmlFor={`date-${option.value}`} className="ml-2 text-sm">
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}
