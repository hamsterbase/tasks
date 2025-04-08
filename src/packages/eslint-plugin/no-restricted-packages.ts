import { Rule } from 'eslint';

interface PackageRule {
  name: string;
  alternative?: string;
}

const rule: Rule.RuleModule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Restrict importing specific packages',
      category: 'Best Practices',
      recommended: false,
    },
    schema: [
      {
        type: 'object',
        properties: {
          packages: {
            type: 'array',
            items: {
              oneOf: [
                { type: 'string' },
                {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    alternative: { type: 'string' },
                  },
                  required: ['name'],
                  additionalProperties: false,
                },
              ],
            },
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = (context.options[0] || {}) as { packages?: (string | PackageRule)[] };
    const restrictedPackages: (string | PackageRule)[] = options.packages || [];

    return {
      ImportDeclaration(node) {
        const importSource = node.source.value as string;

        // Check if the imported package is in the restricted list
        const restrictedPackage = restrictedPackages.find((pkg) => {
          const packageName = typeof pkg === 'string' ? pkg : pkg.name;
          return importSource === packageName || importSource.startsWith(`${packageName}/`);
        });

        if (restrictedPackage) {
          const message =
            typeof restrictedPackage === 'string'
              ? `Import from package "${importSource}" is restricted.`
              : restrictedPackage.alternative
                ? `Import from package "${importSource}" is restricted. Please use ${restrictedPackage.alternative} instead.`
                : `Import from package "${importSource}" is restricted.`;

          context.report({
            node,
            message,
          });
        }
      },
    };
  },
};

export default rule;
