import { Label } from '../../../components/ui/label';
import { Checkbox } from '../../../components/ui/checkbox';
import { Badge } from '../../../components/ui/badge';
import type { Domain } from '../types';
import { DOMAIN_LABELS } from '../types';

interface ContentInterestsSelectorProps {
  selectedInterests: Domain[];
  onChange: (interests: Domain[]) => void;
  disabled?: boolean;
}

export function ContentInterestsSelector({
  selectedInterests,
  onChange,
  disabled,
}: ContentInterestsSelectorProps) {
  const toggleInterest = (domain: Domain) => {
    if (selectedInterests.includes(domain)) {
      onChange(selectedInterests.filter((d) => d !== domain));
    } else {
      onChange([...selectedInterests, domain]);
    }
  };

  // Group domains by category for better UX
  const domainCategories = {
    'Business & Professional': [
      'business',
      'office',
      'finance',
      'marketing',
      'human_resources',
      'customer_service',
      'logistics',
      'retail',
    ],
    'Technology & Science': [
      'technology',
      'science',
      'technical',
      'manufacturing',
    ],
    'Social & Services': [
      'education',
      'healthcare',
      'health',
      'legal',
      'legal_compliance',
      'safety',
      'real_estate',
    ],
    'Travel & Lifestyle': [
      'travel',
      'hospitality',
      'cooking',
      'house',
      'outdoor_recreation',
      'daily_life',
    ],
    'Media & Culture': [
      'news',
      'entertainment',
      'sports',
      'politics',
      'environment',
      'media',
    ],
    General: ['general'],
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Content Interests *</Label>
        <p className="text-sm text-muted-foreground mt-1">
          Select topics you're interested in (choose at least 3)
        </p>
        {selectedInterests.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedInterests.map((interest) => (
              <Badge key={interest} variant="secondary">
                {DOMAIN_LABELS[interest]}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {Object.entries(domainCategories).map(([category, domains]) => (
        <div key={category} className="space-y-2">
          <h4 className="text-sm font-medium">{category}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {domains.map((domain) => {
              const typedDomain = domain as Domain;
              return (
                <div key={domain} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${domain}`}
                    checked={selectedInterests.includes(typedDomain)}
                    onCheckedChange={() => toggleInterest(typedDomain)}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`interest-${domain}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {DOMAIN_LABELS[typedDomain]}
                  </label>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
