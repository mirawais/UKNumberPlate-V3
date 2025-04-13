import { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { 
  SiteConfig, 
  NavigationItem, 
  ContentBlock, 
  UploadedFile 
} from '@shared/schema';

// Helper component for file uploads
const FileUploader = ({ 
  label, 
  accept = 'image/*', 
  onUpload 
}: { 
  label: string;
  accept?: string;
  onUpload: (file: UploadedFile) => void;
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      const response = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/uploads'] });
      onUpload(data);
      
      toast({
        title: 'File uploaded',
        description: `${file.name} was uploaded successfully`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="file-upload">{label}</Label>
      <Input
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleFileChange}
        disabled={isUploading}
      />
      {isUploading && (
        <div className="flex items-center">
          <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full mr-2"></div>
          <span>Uploading...</span>
        </div>
      )}
    </div>
  );
};

// Component for managing the site logo and general settings
const SiteSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: siteConfigs, isLoading } = useQuery<SiteConfig[]>({
    queryKey: ['/api/site-configs'],
  });
  
  const logoConfig = siteConfigs?.find(config => config.key === 'site.logo');
  const siteNameConfig = siteConfigs?.find(config => config.key === 'site.name');
  const contactEmailConfig = siteConfigs?.find(config => config.key === 'site.contactEmail');
  const contactPhoneConfig = siteConfigs?.find(config => config.key === 'site.contactPhone');
  
  const updateConfigMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest('POST', '/api/site-configs/upsert', { key, value, type: 'text' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/site-configs'] });
      toast({
        title: 'Settings updated',
        description: 'Site settings have been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const handleLogoUpload = (file: UploadedFile) => {
    updateConfigMutation.mutate({
      key: 'site.logo',
      value: file.id.toString(),
    });
  };
  
  const handleConfigChange = (key: string, value: string) => {
    updateConfigMutation.mutate({ key, value });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Site Settings</CardTitle>
        <CardDescription>Manage your site's logo and general settings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <FileUploader 
                label="Upload Site Logo" 
                onUpload={handleLogoUpload} 
              />
              
              {logoConfig && logoConfig.value && (
                <div className="mt-4">
                  <Label>Current Logo</Label>
                  <img 
                    src={`/api/uploads/${logoConfig.value}`} 
                    alt="Site Logo" 
                    className="mt-2 max-h-24 border rounded shadow-sm" 
                  />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input 
                  id="site-name" 
                  defaultValue={siteNameConfig?.value || ''}
                  onChange={(e) => handleConfigChange('site.name', e.target.value)}
                  placeholder="My Number Plate Shop"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input 
                  id="contact-email" 
                  type="email"
                  defaultValue={contactEmailConfig?.value || ''}
                  onChange={(e) => handleConfigChange('site.contactEmail', e.target.value)}
                  placeholder="contact@example.com"
                />
              </div>
              
              <div>
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input 
                  id="contact-phone" 
                  defaultValue={contactPhoneConfig?.value || ''}
                  onChange={(e) => handleConfigChange('site.contactPhone', e.target.value)}
                  placeholder="+44 123 456 7890"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Component for managing navigation items
const NavigationManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newNavItem, setNewNavItem] = useState({
    label: '',
    url: '',
    orderIndex: '0',
  });
  
  const { data: navigationItems, isLoading } = useQuery<NavigationItem[]>({
    queryKey: ['/api/navigation-items'],
  });
  
  const createNavItemMutation = useMutation({
    mutationFn: async (item: typeof newNavItem) => {
      return apiRequest('POST', '/api/navigation-items', item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation-items'] });
      setNewNavItem({ label: '', url: '', orderIndex: '0' });
      toast({
        title: 'Navigation item added',
        description: 'The navigation item has been added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const updateNavItemMutation = useMutation({
    mutationFn: async ({ id, ...item }: { id: number; isActive: boolean }) => {
      return apiRequest('PUT', `/api/navigation-items/${id}`, item);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation-items'] });
      toast({
        title: 'Navigation item updated',
        description: 'The navigation item has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const deleteNavItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/navigation-items/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/navigation-items'] });
      toast({
        title: 'Navigation item deleted',
        description: 'The navigation item has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete item',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const handleToggleActive = (id: number, isActive: boolean) => {
    updateNavItemMutation.mutate({ id, isActive: !isActive });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createNavItemMutation.mutate(newNavItem);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Navigation Menu</CardTitle>
        <CardDescription>Manage your site's navigation items</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nav-label">Label</Label>
            <Input 
              id="nav-label" 
              value={newNavItem.label}
              onChange={(e) => setNewNavItem({...newNavItem, label: e.target.value})}
              placeholder="About Us"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nav-url">URL</Label>
            <Input 
              id="nav-url" 
              value={newNavItem.url}
              onChange={(e) => setNewNavItem({...newNavItem, url: e.target.value})}
              placeholder="/about"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="nav-order">Display Order</Label>
            <Input 
              id="nav-order" 
              type="number"
              value={newNavItem.orderIndex}
              onChange={(e) => setNewNavItem({...newNavItem, orderIndex: e.target.value})}
              placeholder="0"
              required
            />
          </div>
          
          <Button type="submit" disabled={createNavItemMutation.isPending}>
            {createNavItemMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Adding...
              </>
            ) : 'Add Navigation Item'}
          </Button>
        </form>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Navigation Items</h3>
            {navigationItems?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No navigation items found</p>
            ) : (
              <div className="space-y-2">
                {navigationItems?.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.url}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center space-x-2">
                        <Switch 
                          id={`nav-active-${item.id}`}
                          checked={item.isActive}
                          onCheckedChange={() => handleToggleActive(item.id, item.isActive)}
                        />
                        <Label htmlFor={`nav-active-${item.id}`}>Active</Label>
                      </div>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => deleteNavItemMutation.mutate(item.id)}
                        disabled={deleteNavItemMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for managing content blocks
const ContentManager = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newContent, setNewContent] = useState({
    identifier: '',
    title: '',
    content: '',
    location: 'home'
  });
  
  const { data: contentBlocks, isLoading } = useQuery<ContentBlock[]>({
    queryKey: ['/api/content-blocks'],
  });
  
  const createContentMutation = useMutation({
    mutationFn: async (content: typeof newContent) => {
      return apiRequest('POST', '/api/content-blocks', content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-blocks'] });
      setNewContent({ identifier: '', title: '', content: '', location: 'home' });
      toast({
        title: 'Content block added',
        description: 'The content block has been added successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to add content',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const updateContentMutation = useMutation({
    mutationFn: async ({ id, ...content }: { id: number; isActive: boolean }) => {
      return apiRequest('PUT', `/api/content-blocks/${id}`, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-blocks'] });
      toast({
        title: 'Content block updated',
        description: 'The content block has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update content',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const deleteContentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/content-blocks/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/content-blocks'] });
      toast({
        title: 'Content block deleted',
        description: 'The content block has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to delete content',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const handleToggleActive = (id: number, isActive: boolean) => {
    updateContentMutation.mutate({ id, isActive: !isActive });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createContentMutation.mutate(newContent);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Management</CardTitle>
        <CardDescription>Manage your site's content blocks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content-identifier">Unique Identifier</Label>
            <Input 
              id="content-identifier" 
              value={newContent.identifier}
              onChange={(e) => setNewContent({...newContent, identifier: e.target.value})}
              placeholder="home-hero"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content-title">Title</Label>
            <Input 
              id="content-title" 
              value={newContent.title}
              onChange={(e) => setNewContent({...newContent, title: e.target.value})}
              placeholder="Welcome to our store"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content-location">Location</Label>
            <Input 
              id="content-location" 
              value={newContent.location}
              onChange={(e) => setNewContent({...newContent, location: e.target.value})}
              placeholder="home"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="content-body">Content</Label>
            <Textarea 
              id="content-body" 
              value={newContent.content}
              onChange={(e) => setNewContent({...newContent, content: e.target.value})}
              placeholder="Enter your content here..."
              rows={6}
              required
            />
          </div>
          
          <Button type="submit" disabled={createContentMutation.isPending}>
            {createContentMutation.isPending ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Adding...
              </>
            ) : 'Add Content Block'}
          </Button>
        </form>
        
        {isLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Content Blocks</h3>
            {contentBlocks?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No content blocks found</p>
            ) : (
              <div className="space-y-4">
                {contentBlocks?.map((block) => (
                  <div key={block.id} className="border rounded overflow-hidden">
                    <div className="flex justify-between items-center bg-muted p-3">
                      <div>
                        <h4 className="font-medium">{block.title}</h4>
                        <p className="text-sm text-muted-foreground">ID: {block.identifier} | Location: {block.location}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`content-active-${block.id}`}
                            checked={block.isActive}
                            onCheckedChange={() => handleToggleActive(block.id, block.isActive)}
                          />
                          <Label htmlFor={`content-active-${block.id}`}>Active</Label>
                        </div>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => deleteContentMutation.mutate(block.id)}
                          disabled={deleteContentMutation.isPending}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 bg-card">
                      <p className="whitespace-pre-wrap text-sm">{block.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Component for managing feature toggles
const FeatureToggles = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get all data needed for feature toggles
  const { data: badges } = useQuery({
    queryKey: ['/api/badges'],
  });
  
  const { data: textStyles } = useQuery({
    queryKey: ['/api/text-styles'],
  });
  
  const { data: colors } = useQuery({
    queryKey: ['/api/colors'],
  });
  
  const { data: plateSizes } = useQuery({
    queryKey: ['/api/plate-sizes'],
  });
  
  const { data: carBrands } = useQuery({
    queryKey: ['/api/car-brands'],
  });
  
  const updateFeatureMutation = useMutation({
    mutationFn: async ({ 
      type, 
      id, 
      isActive 
    }: { 
      type: 'badges' | 'text-styles' | 'colors' | 'plate-sizes' | 'car-brands'; 
      id: number; 
      isActive: boolean 
    }) => {
      return apiRequest('PUT', `/api/${type}/${id}`, { isActive });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [`/api/${variables.type}`] });
      toast({
        title: 'Feature updated',
        description: 'The feature has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Failed to update feature',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
    },
  });
  
  const handleToggleFeature = (type: 'badges' | 'text-styles' | 'colors' | 'plate-sizes' | 'car-brands', id: number, currentState: boolean) => {
    updateFeatureMutation.mutate({
      type,
      id,
      isActive: !currentState
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Toggles</CardTitle>
        <CardDescription>Enable or disable features across the site</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="badges">
          <TabsList className="mb-4">
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="textStyles">Text Styles</TabsTrigger>
            <TabsTrigger value="colors">Colors</TabsTrigger>
            <TabsTrigger value="plateSizes">Plate Sizes</TabsTrigger>
            <TabsTrigger value="carBrands">Car Brands</TabsTrigger>
          </TabsList>
          
          <TabsContent value="badges" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges?.map(badge => (
                <div key={badge.id} className="border rounded p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {badge.imagePath && (
                      <img src={badge.imagePath} alt={badge.name} className="w-10 h-10 object-contain" />
                    )}
                    <span>{badge.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`badge-${badge.id}`}
                      checked={badge.isActive}
                      onCheckedChange={() => handleToggleFeature('badges', badge.id, badge.isActive)}
                    />
                    <Label htmlFor={`badge-${badge.id}`}>Active</Label>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="textStyles" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {textStyles?.map(style => (
                <div key={style.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{style.name}</div>
                    <div className="text-sm text-muted-foreground">{style.description}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`style-${style.id}`}
                      checked={style.isActive}
                      onCheckedChange={() => handleToggleFeature('text-styles', style.id, style.isActive)}
                    />
                    <Label htmlFor={`style-${style.id}`}>Active</Label>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="colors" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {colors?.map(color => (
                <div key={color.id} className="border rounded p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-6 h-6 rounded-full border" 
                      style={{ backgroundColor: color.hexCode }}
                    />
                    <span>{color.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`color-${color.id}`}
                      checked={color.isActive}
                      onCheckedChange={() => handleToggleFeature('colors', color.id, color.isActive)}
                    />
                    <Label htmlFor={`color-${color.id}`}>Active</Label>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="plateSizes" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {plateSizes?.map(size => (
                <div key={size.id} className="border rounded p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{size.name}</div>
                    <div className="text-sm text-muted-foreground">{size.dimensions}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`size-${size.id}`}
                      checked={size.isActive}
                      onCheckedChange={() => handleToggleFeature('plate-sizes', size.id, size.isActive)}
                    />
                    <Label htmlFor={`size-${size.id}`}>Active</Label>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="carBrands" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {carBrands?.map(brand => (
                <div key={brand.id} className="border rounded p-3 flex items-center justify-between">
                  <span>{brand.name}</span>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id={`brand-${brand.id}`}
                      checked={brand.isActive}
                      onCheckedChange={() => handleToggleFeature('car-brands', brand.id, brand.isActive)}
                    />
                    <Label htmlFor={`brand-${brand.id}`}>Active</Label>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

const SiteCustomizer = () => {
  const [activeTab, setActiveTab] = useState<string>('features');
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Site Customization</h3>
      
      <Tabs defaultValue="features" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="features">Feature Toggles</TabsTrigger>
          <TabsTrigger value="settings">Site Settings</TabsTrigger>
          <TabsTrigger value="navigation">Navigation Menu</TabsTrigger>
          <TabsTrigger value="content">Content Blocks</TabsTrigger>
        </TabsList>
        
        <TabsContent value="features">
          <FeatureToggles />
        </TabsContent>
        
        <TabsContent value="settings">
          <SiteSettings />
        </TabsContent>
        
        <TabsContent value="navigation">
          <NavigationManager />
        </TabsContent>
        
        <TabsContent value="content">
          <ContentManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SiteCustomizer;