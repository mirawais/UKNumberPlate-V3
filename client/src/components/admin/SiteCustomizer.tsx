import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Loader2, Upload } from 'lucide-react';

interface UploadedFile {
  id: number;
  filename: string;
  originalFilename: string;
  filePath: string;
  fileType: string;
  fileSize: string;
  mimeType: string;
  isActive: boolean;
  fileData: string | null;
  uploadedAt: Date;
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

function FeatureToggle({ label, description, value, onChange }: FeatureToggleProps) {
  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="space-y-0.5">
        <Label htmlFor={`toggle-${label}`}>{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch
        id={`toggle-${label}`}
        checked={value}
        onCheckedChange={onChange}
      />
    </div>
  );
}

export default function SiteCustomizer() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [uploadingFile, setUploadingFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  // Site Configuration
  const { data: siteConfigs, isLoading: loadingConfigs } = useQuery<SiteConfig[]>({
    queryKey: ['/api/site-configs'],
  });
  
  // Content Blocks
  const { data: contentBlocks, isLoading: loadingBlocks } = useQuery<ContentBlock[]>({
    queryKey: ['/api/content-blocks'],
  });
  
  // Navigation Items
  const { data: navigationItems, isLoading: loadingNavigation } = useQuery<NavigationItem[]>({
    queryKey: ['/api/navigation-items'],
  });
  
  // Uploaded Files
  const { data: uploadedFiles, isLoading: loadingFiles } = useQuery<UploadedFile[]>({
    queryKey: ['/api/uploads'],
  });
  
  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: '',
    tagline: '',
    contactEmail: '',
    contactPhone: '',
    primaryColor: '#0070f3',
    logoUrl: '',
  });
  
  // Feature toggle states
  const [features, setFeatures] = useState({
    showBadges: true,
    showBorders: true,
    showCarBrands: true,
    roadLegalPlates: true,
    showPlates: true,
    useStripeCheckout: true,
    allowDocumentUpload: true,
  });
  
  // Load general settings from site config
  useEffect(() => {
    if (siteConfigs) {
      setGeneralSettings(prev => ({
        siteName: siteConfigs.find(c => c.configKey === 'site.name')?.configValue || prev.siteName || '',
        tagline: siteConfigs.find(c => c.configKey === 'site.tagline')?.configValue || prev.tagline || '',
        contactEmail: siteConfigs.find(c => c.configKey === 'site.contactEmail')?.configValue || prev.contactEmail || '',
        contactPhone: siteConfigs.find(c => c.configKey === 'site.contactPhone')?.configValue || prev.contactPhone || '',
        primaryColor: siteConfigs.find(c => c.configKey === 'site.primaryColor')?.configValue || prev.primaryColor || '#0070f3',
        logoUrl: siteConfigs.find(c => c.configKey === 'site.logoUrl')?.configValue || prev.logoUrl || '',
      }));
    }
  }, [siteConfigs]);
  
  // Load feature toggles from site config
  useEffect(() => {
    if (siteConfigs) {
      const featureMap: Record<string, string> = {};
      siteConfigs.forEach(config => {
        if (config.configType === 'feature') {
          // Extract feature name from config key (e.g., "feature.showBadges" -> "showBadges")
          const featureName = config.configKey.split('.')[1];
          featureMap[featureName] = config.configValue;
        }
      });
      
      // Create new features object with proper boolean conversion
      const updatedFeatures = {
        showBadges: featureMap['showBadges'] !== 'false',
        showBorders: featureMap['showBorders'] !== 'false',
        showCarBrands: featureMap['showCarBrands'] !== 'false',
        roadLegalPlates: featureMap['roadLegalPlates'] !== 'false',
        showPlates: featureMap['showPlates'] !== 'false',
        useStripeCheckout: featureMap['useStripeCheckout'] !== 'false',
        allowDocumentUpload: featureMap['allowDocumentUpload'] !== 'false',
      };
      
      // Always update features when configs change
      setFeatures(updatedFeatures);
    }
  }, [siteConfigs]);
  
  // Form setup for content blocks
  const contentForm = useForm({
    defaultValues: {
      identifier: '',
      title: '',
      content: '',
      location: 'home',
      isActive: true,
    },
  });
  
  // Form setup for navigation items
  const navigationForm = useForm({
    defaultValues: {
      label: '',
      url: '',
      orderIndex: '0',
      isActive: true,
      parentId: null,
    },
  });
  
  // Mutations
  const upsertConfigMutation = useMutation({
    mutationFn: (config: { key: string; value: string; type: string; description?: string }) => {
      return apiRequest('POST', '/api/site-configs/upsert', config);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-configs'] });
      toast({
        title: 'Configuration updated',
        description: 'Your site settings have been saved.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating configuration',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const uploadFileMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload file');
      }
      
      return response.json();
    },
    onSuccess: (data: UploadedFile) => {
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      toast({
        title: 'File Uploaded',
        description: `${data.originalFilename} has been uploaded successfully.`,
      });
      setIsUploading(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
      setIsUploading(false);
    }
  });
  
  const createContentBlockMutation = useMutation({
    mutationFn: (block: any) => {
      return apiRequest('POST', '/api/content-blocks', block);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-blocks'] });
      contentForm.reset();
      toast({
        title: 'Content block created',
        description: 'The content block has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating content block',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  const createNavigationItemMutation = useMutation({
    mutationFn: (item: any) => {
      return apiRequest('POST', '/api/navigation-items', item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation-items'] });
      navigationForm.reset();
      toast({
        title: 'Navigation item created',
        description: 'The navigation item has been added successfully.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating navigation item',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Handle feature toggle changes - now only updates the state
  const handleFeatureToggle = (feature: string, value: boolean) => {
    setFeatures({ ...features, [feature]: value });
  };
  
  // Save all general settings at once 
  const saveGeneralSettings = async () => {
    try {
      // Create an array of general settings to update
      const settings = [
        {
          key: 'site.name',
          value: generalSettings.siteName || '',
          type: 'text',
          description: 'Website name displayed in header and title'
        },
        {
          key: 'site.tagline',
          value: generalSettings.tagline || '',
          type: 'text',
          description: 'Short tagline displayed in the header'
        },
        {
          key: 'site.contactEmail',
          value: generalSettings.contactEmail || '',
          type: 'text',
          description: 'Contact email for customer inquiries'
        },
        {
          key: 'site.contactPhone',
          value: generalSettings.contactPhone || '',
          type: 'text',
          description: 'Contact phone for customer inquiries'
        },
        {
          key: 'site.primaryColor',
          value: generalSettings.primaryColor || '#0070f3',
          type: 'color',
          description: 'Primary color used throughout the site'
        },
        {
          key: 'site.logoUrl',
          value: generalSettings.logoUrl || '',
          type: 'text',
          description: 'URL or ID of the site logo image'
        }
      ];

      // Update settings one by one to ensure each succeeds
      for (const config of settings) {
        // Skip empty values to prevent "Missing required fields" error
        if (!config.value && config.value !== '0') continue;
        
        await apiRequest('POST', '/api/site-configs/upsert', config);
      }

      queryClient.invalidateQueries({ queryKey: ['/api/site-configs'] });
      toast({
        title: 'General settings updated',
        description: 'Your site settings have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating settings',
        description: error.message || 'Failed to save general settings',
        variant: 'destructive',
      });
    }
  };

  // Save all feature toggles at once
  const saveFeatureToggles = async () => {
    try {
      // Create an array of all the feature toggle changes to save
      const featureUpdates = Object.entries(features).map(([feature, value]) => ({
        key: `feature.${feature}`,
        value: value.toString(),
        type: 'feature',
        description: `Toggle for ${feature} feature`,
      }));
      
      // Update each feature toggle one by one to ensure each is saved
      for (const config of featureUpdates) {
        await apiRequest('POST', '/api/site-configs/upsert', config);
      }
      
      queryClient.invalidateQueries({ queryKey: ['/api/site-configs'] });
      toast({
        title: 'Features updated',
        description: 'Feature toggles have been saved successfully.',
      });
    } catch (error: any) {
      toast({
        title: 'Error updating features',
        description: error.message || 'Failed to save feature toggles',
        variant: 'destructive',
      });
    }
  };
  
  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadFileMutation.mutate(file);
    }
  };
  
  // Handle content block submission
  const onContentBlockSubmit = (data: any) => {
    createContentBlockMutation.mutate(data);
  };
  
  // Handle navigation item submission
  const onNavigationItemSubmit = (data: any) => {
    createNavigationItemMutation.mutate(data);
  };
  
  if (loadingConfigs || loadingBlocks || loadingNavigation || loadingFiles) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Site Customization</h2>
        <p className="text-muted-foreground">
          Customize the appearance and functionality of your website.
        </p>
      </div>
      
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="features">Feature Toggles</TabsTrigger>
          <TabsTrigger value="content">Content Blocks</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>
        
        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Configuration</CardTitle>
              <CardDescription>
                Update your website's basic information and appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site-name">Site Name</Label>
                    <Input 
                      id="site-name" 
                      placeholder="My Number Plate Company" 
                      defaultValue={siteConfigs?.find(c => c.configKey === 'site.name')?.configValue || ''}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          siteName: e.target.value
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="site-tagline">Tagline</Label>
                    <Input 
                      id="site-tagline" 
                      placeholder="The best UK number plates" 
                      defaultValue={siteConfigs?.find(c => c.configKey === 'site.tagline')?.configValue || ''}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          tagline: e.target.value
                        }));
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input 
                    id="contact-email" 
                    type="email" 
                    placeholder="contact@example.com" 
                    defaultValue={siteConfigs?.find(c => c.configKey === 'site.contactEmail')?.configValue || ''}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({
                        ...prev,
                        contactEmail: e.target.value
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-phone">Contact Phone</Label>
                  <Input 
                    id="contact-phone" 
                    placeholder="+44 123 456789" 
                    defaultValue={siteConfigs?.find(c => c.configKey === 'site.contactPhone')?.configValue || ''}
                    onChange={(e) => {
                      setGeneralSettings(prev => ({
                        ...prev,
                        contactPhone: e.target.value
                      }));
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Primary Color</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="primary-color" 
                      type="color" 
                      className="w-12 h-10" 
                      defaultValue={siteConfigs?.find(c => c.configKey === 'site.primaryColor')?.configValue || '#0070f3'}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          primaryColor: e.target.value
                        }));
                      }}
                    />
                    <Input 
                      type="text" 
                      className="flex-1" 
                      value={generalSettings.primaryColor || siteConfigs?.find(c => c.configKey === 'site.primaryColor')?.configValue || '#0070f3'}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          primaryColor: e.target.value
                        }));
                      }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="site-logo">Site Logo</Label>
                  <div className="flex items-center space-x-2">
                    <Input 
                      id="site-logo" 
                      type="text" 
                      placeholder="URL to your logo image or upload ID"
                      defaultValue={siteConfigs?.find(c => c.configKey === 'site.logoUrl')?.configValue || ''}
                      onChange={(e) => {
                        setGeneralSettings(prev => ({
                          ...prev,
                          logoUrl: e.target.value
                        }));
                      }}
                    />
                    <Button
                      type="button" 
                      variant="outline"
                      onClick={() => {
                        // Just go to the other card on the same tab
                        document.getElementById('media-library-card')?.scrollIntoView({
                          behavior: 'smooth'
                        });
                      }}
                    >
                      Choose From Media
                    </Button>
                  </div>
                  {generalSettings.logoUrl && (
                    <div className="mt-2 p-2 border rounded-md">
                      <p className="text-sm text-muted-foreground mb-1">Current logo:</p>
                      <img 
                        src={generalSettings.logoUrl.startsWith('http') ? generalSettings.logoUrl : `/api/uploads/${generalSettings.logoUrl}`} 
                        alt="Site Logo" 
                        className="max-h-16 object-contain" 
                      />
                    </div>
                  )}
                </div>
                
                <div className="mt-6">
                  <Button 
                    type="button" 
                    onClick={saveGeneralSettings}
                    className="w-full"
                  >
                    Save General Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card id="media-library-card">
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>
                Upload and manage images for your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-medium">Upload New File</h4>
                  <p className="text-sm text-muted-foreground">
                    Supported formats: JPG, PNG, GIF, SVG (Max 5MB)
                  </p>
                </div>
                <div className="flex items-center">
                  <Input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept="image/*"
                  />
                  <Button
                    onClick={() => document.getElementById('file-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload File
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Uploaded Files</h4>
                {uploadedFiles && uploadedFiles.length > 0 ? (
                  <div className="grid grid-cols-4 gap-4">
                    {uploadedFiles.map((file) => (
                      <div 
                        key={file.id} 
                        className="border rounded-md overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                        onClick={() => {
                          if (file.mimeType.startsWith('image/')) {
                            setGeneralSettings(prev => ({
                              ...prev,
                              logoUrl: String(file.id)
                            }));
                            toast({
                              title: "Image Selected",
                              description: `Selected ${file.originalFilename} as site logo.`,
                            });
                            // Scroll back to the site logo section
                            document.getElementById('site-logo')?.scrollIntoView({
                              behavior: 'smooth'
                            });
                          } else {
                            toast({
                              title: "Invalid Selection",
                              description: "Only image files can be used as site logo.",
                              variant: "destructive"
                            });
                          }
                        }}
                      >
                        {file.mimeType.startsWith('image/') ? (
                          <div className="aspect-square bg-slate-100 relative">
                            <img
                              src={`/api/uploads/${file.id}`}
                              alt={file.originalFilename}
                              className="object-contain w-full h-full p-2"
                            />
                          </div>
                        ) : (
                          <div className="aspect-square bg-slate-100 flex items-center justify-center">
                            <div className="text-2xl font-bold uppercase">{file.fileType}</div>
                          </div>
                        )}
                        <div className="p-2 bg-white">
                          <div className="text-xs font-medium truncate" title={file.originalFilename}>
                            {file.originalFilename}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {parseInt(file.fileSize) > 1024 * 1024
                              ? `${(parseInt(file.fileSize) / (1024 * 1024)).toFixed(2)} MB`
                              : `${(parseInt(file.fileSize) / 1024).toFixed(2)} KB`}
                          </div>
                          {file.mimeType.startsWith('image/') && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="w-full mt-1 text-xs h-7"
                              onClick={(e) => {
                                e.stopPropagation();
                                setGeneralSettings(prev => ({
                                  ...prev,
                                  logoUrl: String(file.id)
                                }));
                                toast({
                                  title: "Image Selected",
                                  description: `Selected ${file.originalFilename} as site logo.`,
                                });
                                document.getElementById('site-logo')?.scrollIntoView({
                                  behavior: 'smooth'
                                });
                              }}
                            >
                              Use as Logo
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">No files uploaded yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Feature Toggles */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable features on your website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="appearance">
                <AccordionItem value="appearance">
                  <AccordionTrigger>Appearance Features</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <FeatureToggle
                      label="Show Badge Options"
                      description="Allow users to add badges to their number plates"
                      value={features.showBadges}
                      onChange={(value) => handleFeatureToggle('showBadges', value)}
                    />
                    <FeatureToggle
                      label="Show Border Options"
                      description="Allow users to add borders to their number plates"
                      value={features.showBorders}
                      onChange={(value) => handleFeatureToggle('showBorders', value)}
                    />
                    <FeatureToggle
                      label="Show Car Brand Options"
                      description="Allow users to select car brand surrounds"
                      value={features.showCarBrands}
                      onChange={(value) => handleFeatureToggle('showCarBrands', value)}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="products">
                  <AccordionTrigger>Product Features</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <FeatureToggle
                      label="Road Legal Plates"
                      description="Enable the Road Legal Plates section"
                      value={features.roadLegalPlates}
                      onChange={(value) => handleFeatureToggle('roadLegalPlates', value)}
                    />
                    <FeatureToggle
                      label="Show Plates"
                      description="Enable the Show Plates section"
                      value={features.showPlates}
                      onChange={(value) => handleFeatureToggle('showPlates', value)}
                    />
                    <FeatureToggle
                      label="Allow Document Upload"
                      description="Allow users to upload documents for road legal plates"
                      value={features.allowDocumentUpload}
                      onChange={(value) => handleFeatureToggle('allowDocumentUpload', value)}
                    />
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="payment">
                  <AccordionTrigger>Payment Features</AccordionTrigger>
                  <AccordionContent className="space-y-2">
                    <FeatureToggle
                      label="Use Stripe Checkout"
                      description="Process payments with Stripe"
                      value={features.useStripeCheckout}
                      onChange={(value) => handleFeatureToggle('useStripeCheckout', value)}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="mt-6 flex justify-end">
                <Button 
                  type="button" 
                  onClick={saveFeatureToggles}
                  className="w-full sm:w-auto"
                >
                  Save Feature Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Content Blocks */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Blocks</CardTitle>
              <CardDescription>
                Manage the content displayed on your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...contentForm}>
                <form onSubmit={contentForm.handleSubmit(onContentBlockSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contentForm.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Identifier</FormLabel>
                          <FormControl>
                            <Input placeholder="home-hero" {...field} />
                          </FormControl>
                          <FormDescription>
                            Unique identifier for this content block
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contentForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <Input placeholder="Home Page Hero" {...field} />
                          </FormControl>
                          <FormDescription>
                            Title for reference purposes
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={contentForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <textarea 
                            className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Content goes here..." 
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          HTML is allowed for formatting
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={contentForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <select
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              {...field}
                            >
                              <option value="home">Home Page</option>
                              <option value="about">About Page</option>
                              <option value="header">Header</option>
                              <option value="footer">Footer</option>
                              <option value="sidebar">Sidebar</option>
                            </select>
                          </FormControl>
                          <FormDescription>
                            Where this content will be displayed
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={contentForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Display this content on the website
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Content Block
                  </Button>
                </form>
              </Form>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Existing Content Blocks</h4>
                {contentBlocks && contentBlocks.length > 0 ? (
                  <div className="space-y-2">
                    {contentBlocks.map((block) => (
                      <div key={block.id} className="border rounded-md p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium">{block.title}</h5>
                            <div className="text-sm text-muted-foreground">
                              ID: {block.identifier} | Location: {block.location}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={block.isActive} />
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                        <div className="text-sm bg-muted/20 rounded p-2 max-h-20 overflow-y-auto">
                          {block.content}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">No content blocks created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Navigation */}
        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Menu</CardTitle>
              <CardDescription>
                Customize the navigation menu of your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...navigationForm}>
                <form onSubmit={navigationForm.handleSubmit(onNavigationItemSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={navigationForm.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Menu Label</FormLabel>
                          <FormControl>
                            <Input placeholder="Home" {...field} />
                          </FormControl>
                          <FormDescription>
                            Text displayed in the menu
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={navigationForm.control}
                      name="url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>URL</FormLabel>
                          <FormControl>
                            <Input placeholder="/" {...field} />
                          </FormControl>
                          <FormDescription>
                            Link destination (e.g., /about)
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={navigationForm.control}
                      name="orderIndex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormDescription>
                            Lower numbers appear first
                          </FormDescription>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={navigationForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Show this item in navigation
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full">
                    Add Navigation Item
                  </Button>
                </form>
              </Form>
              
              <Separator />
              
              <div className="space-y-2">
                <h4 className="font-medium">Navigation Structure</h4>
                {navigationItems && navigationItems.length > 0 ? (
                  <div className="space-y-2">
                    {navigationItems
                      .sort((a, b) => parseInt(a.orderIndex) - parseInt(b.orderIndex))
                      .map((item) => (
                        <div key={item.id} className="flex items-center justify-between border rounded-md p-3">
                          <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-muted-foreground">
                              URL: {item.url} | Order: {item.orderIndex}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Switch checked={item.isActive} />
                            <Button variant="outline" size="sm">Edit</Button>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center p-4 border rounded-md bg-muted/10">
                    <p className="text-muted-foreground">No navigation items created yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}