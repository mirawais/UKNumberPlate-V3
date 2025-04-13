import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface SiteConfig {
  id: number;
  key: string;
  value: string;
  type: string;
  description: string | null;
  updatedAt: Date;
}

interface SiteFeatures {
  showBadges: boolean;
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
}

const defaultFeatures: SiteFeatures = {
  showBadges: true,
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
});

export const SiteConfigProvider = ({ children }: { children: ReactNode }) => {
  const [features, setFeatures] = useState<SiteFeatures>(defaultFeatures);
  const [siteInfo, setSiteInfo] = useState<SiteInfo>(defaultSiteInfo);
  
  const { data: siteConfigs, isLoading } = useQuery<SiteConfig[]>({
    queryKey: ['/api/site-configs'],
  });

  useEffect(() => {
    if (siteConfigs) {
      // Process features
      const featureMap: Record<string, string> = {};
      siteConfigs.forEach(config => {
        if (config.type === 'feature') {
          // Extract feature name from config key (e.g., "feature.showBadges" -> "showBadges")
          const featureName = config.key.split('.')[1];
          featureMap[featureName] = config.value;
        }
      });
      
      // Update features based on config
      setFeatures({
        showBadges: featureMap['showBadges'] === 'true',
        showBorders: featureMap['showBorders'] === 'true',
        showCarBrands: featureMap['showCarBrands'] === 'true',
        roadLegalPlates: featureMap['roadLegalPlates'] === 'true',
        showPlates: featureMap['showPlates'] === 'true',
        useStripeCheckout: featureMap['useStripeCheckout'] === 'true',
        allowDocumentUpload: featureMap['allowDocumentUpload'] === 'true',
      });
      
      // Update site info
      setSiteInfo({
        siteName: siteConfigs.find(c => c.key === 'site.name')?.value || defaultSiteInfo.siteName,
        tagline: siteConfigs.find(c => c.key === 'site.tagline')?.value || defaultSiteInfo.tagline,
        contactEmail: siteConfigs.find(c => c.key === 'site.contactEmail')?.value || defaultSiteInfo.contactEmail,
        contactPhone: siteConfigs.find(c => c.key === 'site.contactPhone')?.value || defaultSiteInfo.contactPhone,
        primaryColor: siteConfigs.find(c => c.key === 'site.primaryColor')?.value || defaultSiteInfo.primaryColor,
        logoUrl: siteConfigs.find(c => c.key === 'site.logoUrl')?.value || defaultSiteInfo.logoUrl,
      });
    }
  }, [siteConfigs]);

  return (
    <SiteConfigContext.Provider value={{ features, siteInfo, isLoading }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => useContext(SiteConfigContext);