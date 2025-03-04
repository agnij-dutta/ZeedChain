import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Sample startup data
const startupData = {
  "startup_name": "InnoFund",
  "logo_url": "/api/placeholder/100/100",
  "current_valuation": "$250K",
  "funding_progress": 65,
  "total_amount_being_raised": "$500K",
  "minimum_investment": "$5K",
  "available_equity_offered": "10%",
  "industry": "FinTech",
  "university_affiliation": "MIT"
};

const StartupCard = ({ startup = startupData }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg rounded-sm p-2">
      <CardHeader className="flex flex-row items-center space-x-4 pb-2">
        <img 
          src={startup.logo_url} 
          alt={`${startup.startup_name} logo`}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div>
          <CardTitle className="text-xl font-bold">{startup.startup_name}</CardTitle>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="secondary">{startup.industry}</Badge>
            <Badge variant="outline">{startup.university_affiliation}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Valuation</p>
            <p className="font-semibold">{startup.current_valuation}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Raising</p>
            <p className="font-semibold">{startup.total_amount_being_raised}</p>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Funding Progress</p>
          <Progress value={startup.funding_progress} className="w-full" />
          <p className="text-sm text-muted-foreground mt-1 text-right">
            {startup.funding_progress}% Funded
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t pt-4">
          <div>
            <p className="text-xs text-muted-foreground">Min Investment</p>
            <p className="font-medium text-sm">{startup.minimum_investment}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Equity Offered</p>
            <p className="font-medium text-sm">{startup.available_equity_offered}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">University</p>
            <p className="font-medium text-sm">{startup.university_affiliation}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StartupCard;

// Sample JSON data that can be used with the component
const startupDataSchema = {
  "type": "object",
  "properties": {
    "startup_name": {"type": "string"},
    "logo_url": {"type": "string"},
    "current_valuation": {"type": "string"},
    "funding_progress": {"type": "number", "minimum": 0, "maximum": 100},
    "total_amount_being_raised": {"type": "string"},
    "minimum_investment": {"type": "string"},
    "available_equity_offered": {"type": "string"},
    "industry": {"type": "string"},
    "university_affiliation": {"type": "string"}
  }
};