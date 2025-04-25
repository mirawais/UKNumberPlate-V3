import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface SiteConfig {
  id: number;
  configKey: string;
  configValue: string;
  configType: string;
  description: string | null;
  updatedAt: Date;
}

interface SiteFeatures {
  showBadges: boolean;
  showTextColors: boolean;
  showBorders: boolean;
  showCarBrands: boolean;
  roadLegalPlates: boolean;
  showPlates: boolean;
  useStripeCheckout: boolean;
  allowDocumentUpload: boolean;
}

interface SiteInfo {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  primaryColor: string;
  logoUrl: string;
}

interface SiteConfigContextType {
  features: SiteFeatures;
  siteInfo: SiteInfo;
  isLoading: boolean;
  refreshConfig: () => void;
}

const defaultFeatures: SiteFeatures = {
  showBadges: true,
  showTextColors: true,
  showBorders: true,
  showCarBrands: true,
  roadLegalPlates: true,
  showPlates: true,
  useStripeCheckout: false,
  allowDocumentUpload: true,
};

const defaultSiteInfo: SiteInfo = {
  siteName: 'Number Plate Store',
  tagline: 'UK Number Plates',
  contactEmail: 'contact@example.com',
  contactPhone: '+44 123 456 7890',
  primaryColor: '#0070f3',
  logoUrl: '',
};

const SiteConfigContext = createContext<SiteConfigContextType>({
  features: defaultFeatures,
  siteInfo: defaultSiteInfo,
  isLoading: true,
  refreshConfig: () => {}
});

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [features, setFeatures] = useState<SiteFeatures>(defaultFeatures);
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo);
  const queryClient = useQueryClient();
  
  const { data: siteConfigs, isLoading, refetch } = useQuery<SiteConfig[]>({
    queryKey: ['/api/site-configs'],
    refetchOnWindowFocus: true,
    staleTime: 5000, // Consider data stale after 5 seconds
  });

  // Function to refresh configuration data
  const refreshConfig = () => {
    refetch();
  };

  // Function to convert hex color to HSL values
  const hexToHSL = (hexColor: string): string => {
    // Remove the hash if it exists
    hexColor = hexColor.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hexColor.substring(0, 2), 16) / 255;
    const g = parseInt(hexColor.substring(2, 4), 16) / 255;
    const b = parseInt(hexColor.substring(4, 6), 16) / 255;
    
    // Find the max and min values to compute the lightness
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    let h = 0;
    let s = 0;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      if (max === r) {
        h = (g - b) / d + (g < b ? 6 : 0);
      } else if (max === g) {
        h = (b - r) / d + 2;
      } else if (max === b) {
        h = (r - g) / d + 4;
      }
      
      h *= 60;
    }
    
    // Round values for CSS
    h = Math.round(h);
    s = Math.round(s * 100);
    const lightness = Math.round(l * 100);
    
    return `${h} ${s}% ${lightness}%`;
  };
  
  // Update CSS variables when primary color changes
  const updateCSSVariables = (primaryColor: string) => {
    if (primaryColor && primaryColor.startsWith('#')) {
      const hslValue = hexToHSL(primaryColor);
      document.documentElement.style.setProperty('--primary', hslValue);
    }
  };

  useEffect(() => {
    if (siteConfigs) {
      // Process features
      const featureMap: Record<string, string> = {};
      siteConfigs.forEach(config => {
        if (config.configType === 'feature') {
          // Extract feature name from config key (e.g., "feature.showBadges" -> "showBadges")
          const featureName = config.configKey.split('.')[1];
          featureMap[featureName] = config.configValue;
        }
      });
      
      // Update features based on config
      setFeatures({
        showBadges: featureMap['showBadges'] === 'true',
        showTextColors: featureMap['showTextColors'] === 'true',
        showBorders: featureMap['showBorders'] === 'true',
        showCarBrands: featureMap['showCarBrands'] === 'true',
        roadLegalPlates: featureMap['roadLegalPlates'] === 'true',
        showPlates: featureMap['showPlates'] === 'true',
        useStripeCheckout: featureMap['useStripeCheckout'] === 'true',
        allowDocumentUpload: featureMap['allowDocumentUpload'] === 'true',
      });
      
      // Get primary color from config
      const primaryColor = siteConfigs.find(c => c.configKey === 'site.primaryColor')?.configValue || defaultSiteInfo.primaryColor;
      
      // Update site info
      setSiteInfo({
        siteName: siteConfigs.find(c => c.configKey === 'site.name')?.configValue || defaultSiteInfo.siteName,
        tagline: siteConfigs.find(c => c.configKey === 'site.tagline')?.configValue || defaultSiteInfo.tagline,
        contactEmail: siteConfigs.find(c => c.configKey === 'site.contactEmail')?.configValue || defaultSiteInfo.contactEmail,
        contactPhone: siteConfigs.find(c => c.configKey === 'site.contactPhone')?.configValue || defaultSiteInfo.contactPhone,
        primaryColor,
        logoUrl: siteConfigs.find(c => c.configKey === 'site.logoUrl')?.configValue || defaultSiteInfo.logoUrl,
      });
      
      // Update CSS variables with the primary color
      updateCSSVariables(primaryColor);
    }
  }, [siteConfigs]);

  return (
    <SiteConfigContext.Provider value={{ features, siteInfo, isLoading, refreshConfig }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);