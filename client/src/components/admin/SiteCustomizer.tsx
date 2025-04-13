import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Upload, ImagePlus, Trash2, RefreshCw, Check, X } from 'lucide-react';

interface UploadedFile {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  fileType: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date;
}

interface SiteConfig {
  id: number;
  configKey: string;
  configValue: string;
  configType: string;
  description: string | null;
  updatedAt: Date;
}

interface NavigationItem {
  id: number;
  label: string;
  url: string;
  orderIndex: string;
  isActive: boolean;
  parentId: string | null;
}

interface ContentBlock {
  id: number;
  identifier: string;
  title: string;
  content: string;
  location: string;
  isActive: boolean;
  updatedAt: Date;
}

interface FeatureToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const FeatureToggle: React.FC<FeatureToggleProps> = ({ label, description, value, onChange }) => {
  return (
    <div className="flex items-center justify-between space-x-2 rounded-md border p-4">
      <div className="space-y-0.5">
        <Label htmlFor={`toggle-${label}`}>{label}</Label>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <Switch
        id={`toggle-${label}`}
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  )
}

const SiteCustomizer: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("general");
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<string>("logo");
  
  // Fetch site configuration
  const { data: siteConfigs, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ['/api/site-configs'],
    select: (data: SiteConfig[]) => {
      // Group configs by key for easier access
      const configs: Record<string, SiteConfig> = {};
      data.forEach(config => {
        configs[config.configKey] = config;
      });
      return configs;
    }
  });
  
  // Fetch uploaded files
  const { data: uploadedFiles, isLoading: isLoadingFiles } = useQuery({
    queryKey: ['/api/uploads'],
    select: (data: UploadedFile[]) => {
      return data.filter(file => file.fileType.match(/^(jpg|jpeg|png|gif|svg)$/i));
    }
  });
  
  // Get feature toggles state
  const useBadges = siteConfigs?.['feature.badges']?.configValue === 'true';
  const useColors = siteConfigs?.['feature.colors']?.configValue === 'true';
  const useBorders = siteConfigs?.['feature.borders']?.configValue === 'true';
  const useCarBrands = siteConfigs?.['feature.car_brands']?.configValue === 'true';
  
  // Get color scheme
  const primaryColor = siteConfigs?.['theme.primary_color']?.configValue || '#1e40af';
  const secondaryColor = siteConfigs?.['theme.secondary_color']?.configValue || '#6b7280';
  const logoUrl = siteConfigs?.['site.logo_url']?.configValue;
  const siteTitle = siteConfigs?.['site.title']?.configValue || 'UK Number Plate Customizer';
  
  // Update site config mutation
  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value, type, description }: { key: string, value: string, type: string, description?: string }) => {
      const response = await apiRequest('POST', '/api/site-configs/upsert', { key, value, type, description });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-configs'] });
      toast({
        title: "Settings updated",
        description: "Your site configuration has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating settings",
        description: error.message || "There was an error updating the site configuration.",
        variant: "destructive",
      });
    }
  });
  
  // File upload mutation
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: (data: UploadedFile) => {
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      
      // Update appropriate config based on uploadType
      if (uploadType === 'logo') {
        updateConfigMutation.mutate({
          key: 'site.logo_url', 
          value: `/api/uploads/${data.id}`, 
          type: 'string',
          description: 'Site logo URL'
        });
      }
      
      setFileToUpload(null);
      toast({
        title: "File uploaded",
        description: "The file was uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error uploading file",
        description: error.message || "There was an error uploading the file.",
        variant: "destructive",
      });
    }
  });
  
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileToUpload(e.target.files[0]);
    }
  };
  
  // Handle file upload
  const handleUpload = () => {
    if (fileToUpload) {
      uploadFileMutation.mutate(fileToUpload);
    }
  };
  
  // Handle feature toggle
  const handleFeatureToggle = (feature: string, value: boolean) => {
    updateConfigMutation.mutate({
      key: `feature.${feature}`,
      value: value.toString(),
      type: 'boolean',
      description: `Toggle for ${feature.replace('_', ' ')} feature`
    });
  };
  
  // Update color scheme
  const handleColorChange = (colorType: string, value: string) => {
    updateConfigMutation.mutate({
      key: `theme.${colorType}_color`,
      value,
      type: 'string',
      description: `${colorType.replace('_', ' ')} color for theme`
    });
  };
  
  // Update site title
  const handleSiteTitleChange = (value: string) => {
    updateConfigMutation.mutate({
      key: 'site.title',
      value,
      type: 'string',
      description: 'Site title'
    });
  };
  
  if (isLoadingConfigs || isLoadingFiles) {
    return (
      <div className="flex items-center justify-center h-48">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading site configuration...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 pb-8">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Site Customizer</h2>
        <p className="text-muted-foreground">
          Manage your site's appearance, features, and content.
        </p>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>
                Update basic information about your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-title">Site Title</Label>
                <Input 
                  id="site-title" 
                  value={siteTitle} 
                  onChange={(e) => handleSiteTitleChange(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Site Logo</Label>
                <div className="flex flex-col items-center p-4 border rounded-md">
                  {logoUrl && (
                    <img 
                      src={logoUrl} 
                      alt="Site Logo" 
                      className="h-16 object-contain mb-4" 
                    />
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="max-w-sm"
                    />
                    <Button 
                      onClick={handleUpload} 
                      disabled={!fileToUpload || uploadFileMutation.isPending}
                      size="sm"
                    >
                      {uploadFileMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="features" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable specific features on your site.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FeatureToggle 
                label="Badges" 
                description="Allow customers to add badges to plates"
                value={useBadges} 
                onChange={(value) => handleFeatureToggle('badges', value)} 
              />
              
              <FeatureToggle 
                label="Text Colors" 
                description="Allow customers to change text colors"
                value={useColors} 
                onChange={(value) => handleFeatureToggle('colors', value)} 
              />
              
              <FeatureToggle 
                label="Borders" 
                description="Allow customers to add borders to plates"
                value={useBorders} 
                onChange={(value) => handleFeatureToggle('borders', value)} 
              />
              
              <FeatureToggle 
                label="Car Brands" 
                description="Allow customers to select their car brand"
                value={useCarBrands} 
                onChange={(value) => handleFeatureToggle('car_brands', value)} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color Scheme</CardTitle>
              <CardDescription>
                Customize your site's color scheme.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="primary-color" 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => handleColorChange('primary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="secondary-color">Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input 
                      id="secondary-color" 
                      type="color" 
                      value={secondaryColor} 
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input 
                      value={secondaryColor} 
                      onChange={(e) => handleColorChange('secondary', e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Color Preview</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div 
                    className="h-16 rounded-md flex items-center justify-center text-white" 
                    style={{ backgroundColor: primaryColor }}
                  >
                    Primary
                  </div>
                  <div 
                    className="h-16 rounded-md flex items-center justify-center text-white" 
                    style={{ backgroundColor: secondaryColor }}
                  >
                    Secondary
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
              <CardDescription>
                Manage content blocks that appear throughout your site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  Content blocks management is coming in a future update.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Manage images and other media files.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>Upload New Image</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="max-w-sm"
                    />
                    <Button 
                      onClick={handleUpload} 
                      disabled={!fileToUpload || uploadFileMutation.isPending}
                      size="sm"
                    >
                      {uploadFileMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      Upload
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedFiles && uploadedFiles.map((file) => (
                    <div key={file.id} className="border rounded-md overflow-hidden">
                      <div className="h-24 bg-slate-100 flex items-center justify-center">
                        <img 
                          src={`/api/uploads/${file.id}`} 
                          alt={file.originalName}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div className="p-2 text-xs truncate">{file.originalName}</div>
                    </div>
                  ))}
                  
                  {(!uploadedFiles || uploadedFiles.length === 0) && (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No images uploaded yet. Upload an image to see it here.
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteCustomizer;